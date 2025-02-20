const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const { db } = require("../config/firebase");

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

cloudinary.config({
  cloud_name: "diwtb2b9i",
  api_key: "811756427869182",
  api_secret: "P0qC5uVxSnngdu6roeCdidrx_F8",
});

router.post("/updateRecipeImage", upload.single("file"), async (req, res) => {
  const { recipeId, oldImageUrl } = req.body;

  if (!recipeId || !req.file) {
    console.error("Missing recipeId or file in request.");
    return res
      .status(400)
      .json({ message: "Recipe ID and image file are required." });
  }

  try {
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ folder: "recipes/" }, (error, cloudinaryResult) => {
          if (error) {
            console.error("Cloudinary upload error:", error);
            return reject(new Error("Failed to upload image to Cloudinary."));
          }
          resolve(cloudinaryResult);
        })
        .end(req.file.buffer);
    });

    const newImageUrl = result.secure_url;

    if (oldImageUrl) {
      const publicId = oldImageUrl.split("/").slice(-2).join("/").split(".")[0];

      const destroyResult = await cloudinary.uploader.destroy(publicId);
    }

    const recipeRef = db.collection("recipes").doc(recipeId);

    await recipeRef.update({ imageURL: newImageUrl });

    res.status(200).json({ newImageUrl });
  } catch (error) {
    console.error("Error updating recipe image:", error);
    res.status(500).json({ message: "Failed to update recipe image." });
  }
});

module.exports = router;
