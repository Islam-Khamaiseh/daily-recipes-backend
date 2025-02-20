const express = require("express");
const { db } = require("../config/firebase");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");
const router = express.Router();

router.get("/getRecipe", optionalVerifyToken, async (req, res) => {
  try {
    const { recipeId } = req.query;

    if (!recipeId) {
      return res.status(400).send("Recipe ID is required");
    }

    const recipeDoc = await db.collection("recipes").doc(recipeId).get();

    if (!recipeDoc.exists) {
      return res.status(404).send("Recipe not found");
    }

    const recipe = recipeDoc.data();
    recipe.id = recipeDoc.id;

    res.status(200).json(recipe);
  } catch (error) {
    console.error("Error fetching recipe:", error.message);
    res.status(500).send("Error fetching recipe");
  }
});

module.exports = router;
