const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

router.get("/recentRecipes", async (req, res) => {
  try {
    const recipesSnapshot = await db
      .collection("recipes")
      .orderBy("createdAt", "desc")
      .limit(8)
      .get();

    const recentRecipes = recipesSnapshot.docs.map((doc) => doc.id);

    res.status(200).json({ recentRecipes });
  } catch (error) {
    console.error("Error fetching recent recipes:", error);
    res.status(500).json({ error: "Failed to fetch recent recipes" });
  }
});

module.exports = router;
