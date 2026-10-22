
const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");

const StudyMaterial = require("../models/StudyMaterial");
const upload = require("../middleware/upload");
const { uploadBuffer, getBucket } = require("../utils/gridfs");

// Separate upload middleware for study materials.
const materialUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
    ];

    const allowedExtensions = [".pdf", ".txt"];
    const extension = require("path")
      .extname(file.originalname)
      .toLowerCase();

    if (
      allowedTypes.includes(file.mimetype) &&
      allowedExtensions.includes(extension)
    ) {
      return callback(null, true);
    }

    callback(new Error("Only PDF and TXT files are allowed."));
  },
});

const router = express.Router();

// Authentication middleware matching the existing posts API.
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required." });
    }

    const token = authHeader.split(" ")[1];
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const User = require("../models/User");
    const user = await User.findById(decoded.userId).select("_id fullName role");

    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Upload a study material.
router.post(
  "/",
  authenticateUser,
  materialUpload.single("file"),
  async (req, res) => {
    let uploadedFileId = null;

    try {
      const title = (req.body.title || "").trim();
      const subject = (req.body.subject || "").trim();
      const description = (req.body.description || "").trim();
      const file = req.file;

      if (!title || !subject || !file) {
        return res.status(400).json({
          message: "Title, subject, and a file are required.",
        });
      }

      uploadedFileId = await uploadBuffer(
        file.buffer,
        file.originalname,
        file.mimetype
      );

      const material = await StudyMaterial.create({
        title,
        subject,
        description,
        fileId: uploadedFileId,
        filename: file.originalname,
        contentType: file.mimetype,
        fileSize: file.size,
        uploadedBy: req.user._id,
      });

      await material.populate("uploadedBy", "fullName role");

      return res.status(201).json({
        message: "Study material uploaded successfully.",
        material,
      });
    } catch (error) {
      console.error("Study material upload error:", error);

      if (uploadedFileId) {
        try {
          await getBucket().delete(uploadedFileId);
        } catch (cleanupError) {
          console.error("GridFS cleanup error:", cleanupError);
        }
      }

      return res.status(500).json({
        message: "Unable to upload study material.",
      });
    }
  }
);





/* Get all study materials */
router.get("/", authenticateUser, async (req, res) => {
  try {
    const materials = await StudyMaterial.find()
      .populate("uploadedBy", "fullName role")
      .sort({ createdAt: -1 });

    return res.status(200).json({ materials });
  } catch (error) {
    console.error("Fetch study materials error:", error);

    return res.status(500).json({
      message: "Unable to fetch study materials.",
    });
  }
});




/* Download a study material */
router.get("/:id/download", authenticateUser, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid study material ID.",
      });
    }

    const material = await StudyMaterial.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        message: "Study material not found.",
      });
    }

    const allowedTypes = ["application/pdf", "text/plain"];

    if (!allowedTypes.includes(material.contentType)) {
      return res.status(400).json({
        message: "This file type cannot be downloaded.",
      });
    }

    const bucket = getBucket();

    res.setHeader("Content-Type", material.contentType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${material.filename.replace(/["\\\r\n]/g, "_")}"`
    );

    const downloadStream = bucket.openDownloadStream(material.fileId);

    downloadStream.on("error", (error) => {
      console.error("Study material download error:", error);

      if (!res.headersSent) {
        res.status(404).json({
          message: "The stored file could not be found.",
        });
      } else {
        res.destroy(error);
      }
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error("Download study material error:", error);

    if (!res.headersSent) {
      res.status(500).json({
        message: "Unable to download study material.",
      });
    }
  }
});




module.exports = router;
