const express = require("express");
const { db, admin } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/saveRecipeToHistory", verifyToken, async (req, res) => {
  try {
    const { recipeId } = req.body;

    if (!recipeId) {
      return res.status(400).send("Recipe ID is required");
    }

    const userId = req.user?.uid;
    if (!userId) {
      return res.status(401).send("Unauthorized");
    }

    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      await userDocRef.set({ historyRecipes: [] });
    }

    const userData = userDoc.data();
    const historyRecipes = userData.historyRecipes || [];

    if (!historyRecipes.includes(recipeId)) {
      await userDocRef.update({
        historyRecipes: admin.firestore.FieldValue.arrayUnion(recipeId),
      });

      res
        .status(200)
        .send({ message: "Recipe saved in history", action: "saved" });
    }
  } catch (error) {
    console.error("Error recipe save in history:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
