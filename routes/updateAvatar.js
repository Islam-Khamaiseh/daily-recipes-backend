const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { db } = require("../config/firebase");
const verifyToken = require("../middleware/authMiddleware");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

cloudinary.config({
  cloud_name: "diwtb2b9i",
  api_key: "811756427869182",
  api_secret: "P0qC5uVxSnngdu6roeCdidrx_F8",
});

router.post(
  "/updateAvatar",
  verifyToken,
  upload.single("file"),
  async (req, res) => {
    const { oldAvatarUrl } = req.body;
    const user = req.user;
    const userId = user.uid;

    if (!userId || !req.file) {
      console.error("Missing userId or file in request.");
      return res
        .status(400)
        .json({ message: "User ID and image file are required." });
    }

    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ folder: "avatars/" }, (error, cloudinaryResult) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              return reject(new Error("Failed to upload image to Cloudinary."));
            }
            resolve(cloudinaryResult);
          })
          .end(req.file.buffer);
      });

      const newAvatarUrl = result.secure_url;

      if (oldAvatarUrl) {
        const publicId = oldAvatarUrl
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        const destroyResult = await cloudinary.uploader.destroy(publicId);
      }

      const userRef = db.collection("users").doc(userId);
      await userRef.update({ avatar: newAvatarUrl });

      res.status(200).json({ newAvatarUrl });
    } catch (error) {
      console.error("Error updating user avatar:", error);
      res.status(500).json({ message: "Failed to update user avatar." });
    }
  }
);

module.exports = router;
