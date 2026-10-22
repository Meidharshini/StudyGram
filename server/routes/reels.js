
const express = require("express");
const multer = require("multer");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Reel = require("../models/Reel");
const { uploadBuffer, getBucket } = require("../utils/gridfs");

const router = express.Router();

const reelUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];

    const allowedExtensions = [".mp4", ".webm", ".mov"];
    const extension = require("path")
      .extname(file.originalname)
      .toLowerCase();

    if (
      allowedTypes.includes(file.mimetype) &&
      allowedExtensions.includes(extension)
    ) {
      return callback(null, true);
    }

    callback(
      new Error("Please upload an MP4, WEBM, or MOV video.")
    );
  },
});

async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please log in to continue.",
      });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        message: "User not found.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
}

// Upload an educational reel.
router.post(
  "/",
  authenticateUser,
  reelUpload.single("video"),
  async (req, res) => {
    let uploadedFileId = null;

    try {
      const caption = (req.body.caption || "").trim();
      const video = req.file;

      if (!caption || !video) {
        return res.status(400).json({
          message: "A caption and video are required.",
        });
      }

      if (!video.mimetype.startsWith("video/")) {
        return res.status(400).json({
          message: "Please select a valid video file.",
        });
      }

      uploadedFileId = await uploadBuffer(
        video.buffer,
        video.originalname,
        video.mimetype
      );

      const reel = await Reel.create({
        caption,
        videoFileId: uploadedFileId,
        filename: video.originalname,
        contentType: video.mimetype,
        fileSize: video.size,
        uploadedBy: req.user._id,
      });

      await reel.populate("uploadedBy", "fullName role");

      return res.status(201).json({
        message: "Reel uploaded successfully!",
        reel,
      });
    } catch (error) {
      console.error("Reel upload error:", error);

      if (uploadedFileId) {
        try {
          await getBucket().delete(uploadedFileId);
        } catch (cleanupError) {
          console.error("Reel cleanup error:", cleanupError);
        }
      }

      return res.status(500).json({
        message: "Unable to upload reel.",
      });
    }
  }
);




/* Get all educational reels */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const reels = await Reel.find()
      .populate("uploadedBy", "fullName role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ reels });
  } catch (error) {
    console.error("Fetch reels error:", error);

    return res.status(500).json({
      message: "Unable to fetch reels.",
    });
  }
});




/* Stream a reel's video */
router.get("/:id/video", authenticateUser, async (req, res) => {
  try {
    if (!require("mongoose").isValidObjectId(req.params.id)) {
      return res.status(400).json({
        message: "Invalid reel ID.",
      });
    }

    const reel = await Reel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({
        message: "Reel not found.",
      });
    }

    res.set("Content-Type", reel.contentType);
    res.set("Content-Disposition", "inline");

    const bucket = getBucket();
    const downloadStream = bucket.openDownloadStream(
      reel.videoFileId
    );

    downloadStream.on("error", (error) => {
      console.error("Reel video streaming error:", error);

      if (!res.headersSent) {
        res.status(404).json({
          message: "Video file not found.",
        });
      } else {
        res.destroy(error);
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Reel video error:", error);

    if (!res.headersSent) {
      return res.status(500).json({
        message: "Unable to load the video.",
      });
    }

    res.destroy(error);
  }
});



module.exports = router;
