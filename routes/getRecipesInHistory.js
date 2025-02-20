const express = require("express");
const { db, admin } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/getRecipesInHistory", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).send("user ID is required");
    }

    let query = db.collection("users").doc(userId);

    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) {
      return res.status(404).send("user not found");
    }

    const userData = userDoc.data();
    const historyRecipes = userData.historyRecipes;

    res.status(200).json(historyRecipes);
  } catch (error) {
    console.error("Error fetching user saved recipes", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
