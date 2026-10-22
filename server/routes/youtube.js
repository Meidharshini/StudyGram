
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/educational", async (req, res) => {
  try {
    const topic = (req.query.topic || "computer science").trim();

    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: `${topic} educational tutorial`,
          type: "video",
          videoEmbeddable: "true",
          maxResults: 10,
          order: "relevance",
          key: process.env.YOUTUBE_API_KEY,
        },
      }
    );

    const videos = response.data.items.map((item) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails.high?.url ||
        item.snippet.thumbnails.default?.url,
      channelTitle: item.snippet.channelTitle,
      publishedAt: item.snippet.publishedAt,
    }));

    res.json({ videos });
  } catch (error) {
    console.error(
      "YouTube search error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      message: "Unable to fetch educational videos from YouTube.",
    });
  }
});

module.exports = router;
