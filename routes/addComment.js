const express = require("express");
const { db, admin } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");
const { FieldValue } = require("firebase-admin/firestore");

const router = express.Router();

router.post("/addComment", verifyToken, async (req, res) => {
  try {
    const { recipeId, content } = req.body;

    if (!recipeId || !content) {
      return res.status(400).send("Recipe ID and content are required");
    }

    const userId = req.user.uid;
    // const userName = req.user.email;

    const userDoc = await db.collection("users").doc(userId).get();
    const userName = userDoc.data().userName;
    const avatar = userDoc.data().avatar;

    const comment = {
      userId,
      userName,
      avatar,
      content,
      timestamp: new Date().toISOString(),
      replies: [],
    };

    const commentsRef = db
      .collection("recipes")
      .doc(recipeId)
      .collection("comments");
    const commentDoc = await commentsRef.add(comment);

    const recipeRef = db.collection("recipes").doc(recipeId);
    await recipeRef.update({
      commentsCounter: FieldValue.increment(1),
    });

    res
      .status(200)
      .send({ message: "Comment added", commentId: commentDoc.id });
  } catch (error) {
    console.error("Error adding comment:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
