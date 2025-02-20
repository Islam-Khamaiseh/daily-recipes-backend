const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const { generateRecipeJSON } = require("../utils/openai");
const optionalVerifyToken = require("../middleware/optionalVerifyToken");

router.post("/generate", optionalVerifyToken, async (req, res) => {
  try {
    const {
      ingredients,
      cookingTime,
      equipments,
      dietarys,
      nutritionalFocus,
      region,
      additionalIngredients2,
    } = req.body;

    const recipeObj = await generateRecipeJSON({
      ingredients,
      cookingTime,
      equipments,
      dietarys,
      nutritionalFocus,
      region,
      additionalIngredients2,
    });

    const { english, arabic } = recipeObj;

    let owner = "guest";
    let ownerName = "guest";

    if (req.user) {
      owner = req.user.uid;

      const userDoc = await db.collection("users").doc(owner).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        ownerName = userData.userName || "Unknown User";
      } else {
        ownerName = "Unknown User";
      }
    }

    const dataToSave = {
      title_en: english.title,
      servings_en: english.servings,
      ingredients_en: english.ingredients,
      instructions_en: english.instructions,
      nutritionalSummary_en: english.nutritionalSummary,

      title_ar: arabic.title,
      servings_ar: arabic.servings,
      ingredients_ar: arabic.ingredients,
      instructions_ar: arabic.instructions,
      nutritionalSummary_ar: arabic.nutritionalSummary,

      savedCounter: "0",
      imageURL:
        "https://res.cloudinary.com/diwtb2b9i/image/upload/v1737013675/dhc43dnbxvivsgybl9bs.jpg",
      ratings: { average: 0, count: 0 },
      commentsCounter: 0,
      owner,
      ownerName,
      createdAt: new Date().toISOString().split("T")[0],
    };

    const docRef = await db.collection("recipes").add(dataToSave);

    return res.json({ success: true, recipeId: docRef.id });
  } catch (error) {
    console.error("Error in /generate route:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
