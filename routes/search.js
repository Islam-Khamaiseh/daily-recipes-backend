const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

const cleanIngredient = (ingredient) => {
  return ingredient
    .toLowerCase()
    .replace(/[0-9]/g, "")
    .replace(/[^a-zA-Z\s]/g, "")
    .trim();
};

router.get("/search", async (req, res) => {
  try {
    let { ingredients } = req.query;

    if (!ingredients) {
      return res.status(400).json({ error: "Ingredients are required." });
    }

    if (typeof ingredients === "string") {
      ingredients = ingredients.split(",").map(cleanIngredient);
    }

    if (ingredients.length === 0) {
      return res
        .status(400)
        .json({ error: "At least one ingredient is required." });
    }

    const recipesRef = db.collection("recipes");
    const querySnapshot = await recipesRef.get();

    let matchingRecipeIds = [];

    querySnapshot.forEach((doc) => {
      const recipe = doc.data();
      const recipeIngredients = recipe.ingredients_en.map(cleanIngredient);

      const containsAll = ingredients.every((ingredient) =>
        recipeIngredients.some((recIng) => recIng.includes(ingredient))
      );

      if (containsAll) {
        matchingRecipeIds.push(doc.id);
      }
    });

    return res.json({ recipeIds: matchingRecipeIds });
  } catch (error) {
    console.error("Error searching recipes:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
