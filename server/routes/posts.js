
const express = require("express");
const jwt = require("jsonwebtoken");
const Post = require("../models/Post");
const User = require("../models/User");

const router = express.Router();


const upload = require("../middleware/upload");
const { uploadBuffer, getBucket } = require("../utils/gridfs");

const mongoose = require("mongoose");


// Verify the login token
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
        message: "User account not found.",
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

// Create a post


router.post(
  "/",
  authenticateUser,
  upload.single("media"),
  async (req, res) => {
    let uploadedFileId = null;

    try {
      const content = (req.body.content || "").trim();
      const file = req.file;

      if (!content && !file) {
        return res.status(400).json({
          message: "Write something or attach an image or video.",
        });
      }

      let mediaDetails = {};

      if (file) {
        const isImage = file.mimetype.startsWith("image/");
        const isVideo = file.mimetype.startsWith("video/");

        if (!isImage && !isVideo) {
          return res.status(400).json({
            message: "Only image and video files are allowed.",
          });
        }

        uploadedFileId = await uploadBuffer(
          file.buffer,
          file.originalname,
          file.mimetype
        );

        mediaDetails = {
          mediaFileId: uploadedFileId,
          mediaType: isImage ? "image" : "video",
          mediaContentType: file.mimetype,
          mediaFilename: file.originalname,
        };
      }

      const post = await Post.create({
        content,
        author: req.user._id,
        ...mediaDetails,
      });

      await post.populate("author", "fullName role");

      return res.status(201).json({
        message: "Post published successfully.",
        post,
      });
    } catch (error) {
      console.error("Create post error:", error);

      // Clean up the uploaded file if creating the post failed.
      if (uploadedFileId) {
        try {
          await getBucket().delete(uploadedFileId);
        } catch (cleanupError) {
          console.error("GridFS cleanup error:", cleanupError);
        }
      }

      return res.status(500).json({
        message: "Unable to publish your post. Please try again.",
      });
    }
  }
);


// Get posts
router.get("/", authenticateUser, async (req, res) => {
  try {
    const posts = await Post.find()
  .populate("author", "fullName role")
  .populate("comments.author", "fullName role")
  .sort({ createdAt: -1 })
  .limit(50);

    return res.status(200).json({ posts });
  } catch (error) {
    console.error("Fetch posts error:", error.message);

    return res.status(500).json({
      message: "Unable to load posts.",
    });
  }
});



router.post("/:id/like", authenticateUser, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    const userId = req.user._id;
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likes.pull(userId);
    } else {
      post.likes.addToSet(userId);
    }

    await post.save();

    return res.status(200).json({
      message: alreadyLiked ? "Like removed." : "Post liked!",
      likes: post.likes.map((id) => id.toString()),
    });
  } catch (error) {
    console.error("Like post error:", error.message);

    return res.status(500).json({
      message: "Unable to update like.",
    });
  }
});




router.post("/:id/comments", authenticateUser, async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Please write a comment.",
      });
    }

    if (content.trim().length > 500) {
      return res.status(400).json({
        message: "Comments cannot exceed 500 characters.",
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        message: "Post not found.",
      });
    }

    post.comments.push({
      content: content.trim(),
      author: req.user._id,
    });

    await post.save();
    await post.populate("comments.author", "fullName role");

    const comment = post.comments[post.comments.length - 1];

    return res.status(201).json({
      message: "Comment added successfully!",
      comment,
    });
  } catch (error) {
    console.error("Add comment error:", error.message);

    return res.status(500).json({
      message: "Unable to add comment.",
    });
  }
});




router.get("/media/:fileId", authenticateUser, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.fileId)) {
      return res.status(400).json({
        message: "Invalid media file ID.",
      });
    }

    const bucket = getBucket();
    const fileId = new mongoose.Types.ObjectId(req.params.fileId);

    const files = await bucket
      .find({ _id: fileId })
      .limit(1)
      .toArray();

    if (!files.length) {
      return res.status(404).json({
        message: "Media file not found.",
      });
    }

    const file = files[0];
    const contentType = file.metadata?.contentType || "application/octet-stream";

    if (
      !contentType.startsWith("image/") &&
      !contentType.startsWith("video/")
    ) {
      return res.status(415).json({
        message: "Unsupported media type.",
      });
    }

    res.set("Content-Type", contentType);
    res.set("Content-Length", String(file.length));
    res.set("X-Content-Type-Options", "nosniff");
    res.set("Cache-Control", "private, max-age=3600");

    const downloadStream = bucket.openDownloadStream(fileId);

    downloadStream.on("error", (error) => {
      console.error("Media download error:", error);
      if (!res.headersSent) {
        res.status(500).end("Unable to retrieve media.");
      } else {
        res.destroy(error);
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Media retrieval error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Unable to retrieve media.",
      });
    }
  }
});




module.exports = router;
