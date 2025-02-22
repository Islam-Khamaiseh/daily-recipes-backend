const express = require("express");
const { db, admin } = require("../config/firebase");
const router = express.Router();

router.get("/getComments", async (req, res) => {
  try {
    const { recipeId } = req.query;

    if (!recipeId) {
      return res.status(400).send("Recipe ID is required");
    }

    const commentsRef = db
      .collection("recipes")
      .doc(recipeId)
      .collection("comments")
      .orderBy("timestamp", "desc");

    const commentsSnapshot = await commentsRef.get();

    if (commentsSnapshot.empty) {
      return res.status(200).json({ comments: [] });
    }

    const comments = commentsSnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        avatar: data.avatar,
        commentId: doc.id,
        userName: data.userName || "Anonymous",
        content:
          typeof data.content === "string" ? data.content : "Invalid content",
        timestamp: data.timestamp || new Date().toISOString(),
        userId: data.userId || "Anonymous",
      };
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error("Error fetching comments:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
