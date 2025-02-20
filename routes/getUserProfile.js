const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");

router.get("/getUserProfile/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).send({ message: "User ID is required" });
    }

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send(userDoc.data());
  } catch (error) {
    console.error("Error fetching user profile:", error.message);
    res.status(500).send({ message: "Failed to fetch user profile" });
  }
});

module.exports = router;
