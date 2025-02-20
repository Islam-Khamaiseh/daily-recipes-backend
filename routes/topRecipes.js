const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

router.get("/topRecipes", async (req, res) => {
  try {
    const recipesSnapshot = await db
      .collection("recipes")
      .orderBy("ratings.count", "desc")
      .limit(4)
      .get();

    const topRecipes = recipesSnapshot.docs.map((doc) => doc.id);

    res.status(200).json({ topRecipes });
  } catch (error) {
    console.error("Error fetching top recipes:", error);
    res.status(500).json({ error: "Failed to fetch top recipes" });
  }
});

module.exports = router;
