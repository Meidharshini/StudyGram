
const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema(
  {
    caption: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    videoFileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    contentType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reel", reelSchema);
