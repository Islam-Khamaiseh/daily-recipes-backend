const express = require("express");
const { db, admin } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.delete("/deleteRating", verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).send("Recipe ID is required");
    }

    const userId = req.user.uid;

    const userDocRef = db.collection("users").doc(userId);
    const recipeDocRef = db.collection("recipes").doc(recipeId);

    await db.runTransaction(async (transaction) => {
      const userDoc = await transaction.get(userDocRef);
      const recipeDoc = await transaction.get(recipeDocRef);

      if (!recipeDoc.exists) {
        throw new Error("Recipe not found");
      }

      const userData = userDoc.data();
      const previousRating = userData.ratings?.[recipeId];

      if (!previousRating) {
        throw new Error("Rating not found");
      }

      const updatedRatings = { ...userData.ratings };
      delete updatedRatings[recipeId];

      transaction.update(userDocRef, { ratings: updatedRatings });

      const recipeData = recipeDoc.data();
      const currentAverage = recipeData.ratings.average;
      const currentCount = recipeData.ratings.count;

      const newCount = currentCount - 1;
      const newAverage =
        newCount > 0
          ? (currentAverage * currentCount - previousRating) / newCount
          : 0;

      transaction.update(recipeDocRef, {
        ratings: {
          average: newAverage,
          count: newCount,
        },
      });
    });

    res.status(200).send("Rating deleted successfully");
  } catch (error) {
    console.error("Error deleting rating:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
