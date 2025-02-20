const express = require("express");
const router = express.Router();
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");

router.post("/updateUserName", verifyToken, async (req, res) => {
  try {
    const user = req.user;
    const { newUserName } = req.body;

    if (!user || !user.uid) {
      return res.status(400).send({ message: "User is not authenticated" });
    }

    if (!newUserName || newUserName.trim() === "") {
      return res.status(400).send({ message: "New username is required" });
    }

    const userId = user.uid;

    const userDocRef = db.collection("users").doc(userId);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      return res.status(404).send({ message: "User not found" });
    }

    await userDocRef.update({ userName: newUserName });

    res.status(200).send({
      message: "Username updated successfully",
      userName: newUserName,
    });
  } catch (error) {
    console.error("Error updating username:", error);
    res
      .status(500)
      .send({ message: "Failed to update username", error: error.message });
  }
});

module.exports = router;
