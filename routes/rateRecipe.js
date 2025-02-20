const express = require("express");
const { db, admin } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/rateRecipe", verifyToken, async (req, res) => {
  try {
    const { recipeId, rating } = req.body;

    if (!recipeId || typeof rating !== "number" || rating < 1 || rating > 5) {
      return res
        .status(400)
        .send("Recipe ID and a valid rating (1-5) are required");
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

      const userData = userDoc.exists ? userDoc.data() : { ratings: {} };
      const recipeData = recipeDoc.data();

      const previousRating = userData.ratings?.[recipeId] || null;

      transaction.set(
        userDocRef,
        {
          ratings: {
            ...userData.ratings,
            [recipeId]: rating,
          },
        },
        { merge: true }
      );

      const currentAverage = recipeData.ratings?.average || 0;
      const currentCount = recipeData.ratings?.count || 0;

      let newAverage, newCount;

      if (previousRating) {
        newCount = currentCount;
        newAverage =
          (currentAverage * currentCount - previousRating + rating) /
          currentCount;
      } else {
        newCount = currentCount + 1;
        newAverage = (currentAverage * currentCount + rating) / newCount;
      }

      transaction.set(
        recipeDocRef,
        {
          ratings: {
            average: newAverage,
            count: newCount,
          },
        },
        { merge: true }
      );
    });

    res.status(200).send("Rating added/updated successfully");
  } catch (error) {
    console.error("Error rating recipe:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
