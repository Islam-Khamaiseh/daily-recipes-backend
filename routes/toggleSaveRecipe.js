const express = require("express");
const { db, admin } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/toggleSaveRecipe", verifyToken, async (req, res) => {
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
      await userDocRef.set({ savedRecipes: [] });
    }

    const userData = userDoc.data();
    const savedRecipes = userData.savedRecipes || [];

    if (savedRecipes.includes(recipeId)) {
      await userDocRef.update({
        savedRecipes: admin.firestore.FieldValue.arrayRemove(recipeId),
      });

      res.status(200).send({ message: "Recipe removed", action: "removed" });
    } else {
      await userDocRef.update({
        savedRecipes: admin.firestore.FieldValue.arrayUnion(recipeId),
      });

      res.status(200).send({ message: "Recipe saved", action: "saved" });
    }
  } catch (error) {
    console.error("Error toggling recipe save:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
