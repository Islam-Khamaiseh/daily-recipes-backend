const express = require("express");
const { db } = require("../config/firebase");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");

const router = express.Router();

router.get("/checkIfSaved", optionalVerifyToken, async (req, res) => {
  try {
    const { recipeId } = req.query;

    if (!recipeId) {
      return res.status(400).json({ message: "Recipe ID is required" });
    }

    const userId = req.user?.uid;

    if (!userId) {
      return res.status(200).json({ isSaved: false });
    }

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(200).json({ isSaved: false });
    }

    const userData = userDoc.data();
    const savedRecipes = userData.savedRecipes || [];
    const isSaved = savedRecipes.some((id) => id.trim() === recipeId.trim());

    return res.status(200).json({ isSaved });
  } catch (error) {
    console.error("Error checking if recipe is saved:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
