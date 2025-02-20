const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");

router.get("/recipesIds", async (req, res) => {
  try {
    const recipesSnapshot = await db.collection("recipes").get();
    const ids = recipesSnapshot.docs.map((doc) => doc.id);
    res.status(200).json({ ids });
  } catch (error) {
    console.error("Error fetching document IDs:", error);
    res.status(500).json({ error: "Failed to fetch document IDs" });
  }
});

module.exports = router;
