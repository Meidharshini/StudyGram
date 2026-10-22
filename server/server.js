
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const postRoutes = require("./routes/posts");
const studyMaterialRoutes = require("./routes/studyMaterials");


const reelsRoutes = require("./routes/reels");


const youtubeRoutes = require("./routes/youtube");

const doubtsRoutes = require("./routes/doubts");
require("dotenv").config();

const app = express();


app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/study-materials", studyMaterialRoutes);
app.use("/api/reels", reelsRoutes);
app.use("/api/youtube", youtubeRoutes);
app.use("/api/doubts", doubtsRoutes);

app.get("/", (req, res) => {
  res.send("StudyGram backend is running!");
});

async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`StudyGram server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();
