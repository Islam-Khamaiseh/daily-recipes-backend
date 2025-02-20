const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");

router.get("/userInfo", verifyToken, async (req, res) => {
  try {
    const user = req.user;

    if (!user || !user.uid) {
      return res
        .status(400)
        .send({ message: "Bad request: user ID is missing" });
    }

    const userId = user.uid;

    const userDoc = await db.collection("users").doc(userId).get();

    if (!userDoc.exists) {
      console.error(`User with ID ${userId} not found.`);
      return res.status(404).send({ message: "User not found" });
    }

    res.status(200).send(userDoc.data());
  } catch (error) {
    console.error("Error fetching user data:", error);
    res
      .status(500)
      .send({ message: "Internal server error", error: error.message });
  }
});

module.exports = router;
