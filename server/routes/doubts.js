
const express = require("express");
const mongoose = require("mongoose");
const Doubt = require("../models/Doubt");
const DoubtReply = require("../models/DoubtReply");
const authMiddleware = require("../middleware/auth");


const router = express.Router();

// Get all doubts
router.get("/", async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate("author", "fullName")
      .sort({ createdAt: -1 });

    res.json(doubts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch doubts." });
  }
});

// Create a doubt
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, topic, description } = req.body;
    const userId = req.user.userId;

    if (!title?.trim() || !topic?.trim() || !description?.trim()) {
      return res.status(400).json({
        message: "Title, topic, and description are required.",
      });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Invalid user session." });
    }

    const doubt = await Doubt.create({
      title: title.trim(),
      topic: topic.trim(),
      description: description.trim(),
      author: userId,
    });

    await doubt.populate("author", "fullName");

    res.status(201).json(doubt);
  } catch (error) {
    console.error("Create doubt error:", error);
    res.status(500).json({ message: "Failed to post doubt." });
  }
});





  
// Get replies for a specific doubt
router.get("/:doubtId/replies", async (req, res) => {
  try {
    const { doubtId } = req.params;

    if (!mongoose.isValidObjectId(doubtId)) {
      return res.status(400).json({ message: "Invalid doubt ID." });
    }

    const doubt = await Doubt.findById(doubtId);

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found." });
    }

    const replies = await DoubtReply.find({ doubt: doubtId })
      .populate("author", "fullName")
      .sort({ createdAt: 1 });

    res.json(replies);
  } catch (error) {
    console.error("Fetch replies error:", error);
    res.status(500).json({ message: "Failed to fetch replies." });
  }
});



  
// Add a reply to a doubt
router.post("/:doubtId/replies", authMiddleware, async (req, res) => {
  try {
    const { doubtId } = req.params;
    const { message } = req.body;
    const userId = req.user.userId;

    if (!mongoose.isValidObjectId(doubtId)) {
      return res.status(400).json({ message: "Invalid doubt ID." });
    }

    if (!mongoose.isValidObjectId(userId)) {
      return res.status(401).json({ message: "Invalid user session." });
    }

    if (typeof message !== "string" || !message.trim()) {
      return res.status(400).json({
        message: "Please enter a reply.",
      });
    }

    const doubt = await Doubt.findById(doubtId);

    if (!doubt) {
      return res.status(404).json({ message: "Doubt not found." });
    }

    const reply = await DoubtReply.create({
      doubt: doubtId,
      author: userId,
      message: message.trim(),
    });

    doubt.replies.push(reply._id);
    await doubt.save();

    await reply.populate("author", "fullName");

    res.status(201).json(reply);
  } catch (error) {
    console.error("Create reply error:", error);
    res.status(500).json({ message: "Failed to post reply." });
  }
});





module.exports = router;
