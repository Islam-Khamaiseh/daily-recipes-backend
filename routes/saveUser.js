const express = require("express");
const { db } = require("../config/firebase");
const admin = require("firebase-admin");
const verifyToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/saveUser", verifyToken, async (req, res) => {
  const { uid, userName, email } = req.body;

  if (!uid || !email) {
    return res
      .status(400)
      .json({ message: "Missing required fields: uid or email" });
  }

  try {
    const userDoc = db.collection("users").doc(uid);
    const userSnapshot = await userDoc.get();

    if (userSnapshot.exists) {
      return res.status(200).json({ message: "User already exists" });
    }

    await userDoc.set({
      userName: userName || "",
      email,
      createdAt: new Date().toISOString().split("T")[0],
      avatar:
        "https://res.cloudinary.com/diwtb2b9i/image/upload/v1737088355/default-avatar-icon-of-social-media-user-vector_umub9i.jpg",
      historyRecipes: [],

      savedRecipes: [],
    });

    res.status(201).json({ message: "User document created successfully" });
  } catch (error) {
    console.error("Error creating user document:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
