const express = require("express");
const { db, admin } = require("../config/firebase");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");

const router = express.Router();

router.get("/getRecipeRatings", optionalVerifyToken, async (req, res) => {
  try {
    const { recipeId } = req.query;

    if (!recipeId) {
      return res.status(400).send("Recipe ID is required");
    }

    const userId = req.user?.uid;

    const recipeDoc = await db.collection("recipes").doc(recipeId).get();
    if (!recipeDoc.exists) {
      return res.status(404).send("Recipe not found");
    }

    const recipeData = recipeDoc.data();
    const averageRating = recipeData.ratings?.average || 0;
    const ratingCount = recipeData.ratings?.count || 0;

    let userRating = null;

    if (userId) {
      const userDoc = await db.collection("users").doc(userId).get();
      const userData = userDoc.exists ? userDoc.data() : {};
      userRating = userData.ratings?.[recipeId] || null;
    }

    res.status(200).json({ averageRating, ratingCount, userRating });
  } catch (error) {
    console.error("Error fetching ratings:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
