
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Reels.css";

const TOPICS = [
  "Java",
  "Python",
  "Web Development",
  "SQL",
  "Data Structures and Algorithms",
  "Aptitude",
];

function Reels() {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("Java");
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `http://localhost:5000/api/youtube/educational?topic=${encodeURIComponent(topic)}`
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Unable to load videos.");
        }

        setVideos(data.videos || []);
      } catch (err) {
        setError(err.message || "Unable to connect to StudyGram.");
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, [topic]);

  return (
    <div className="reels-page">
      <header className="reels-header">
        <h2>🎬 StudyGram Reels</h2>
        <button onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </header>

      <main className="reels-content">
        <h1>Learn Something New</h1>
        <p>Discover educational videos selected for your learning journey.</p>

        <div className="reels-topics">
          {TOPICS.map((item) => (
            <button
              key={item}
              className={topic === item ? "topic-button active" : "topic-button"}
              onClick={() => setTopic(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loading && <p>Finding educational videos...</p>}
        {error && <p className="reels-error">{error}</p>}

        {!loading && !error && videos.length === 0 && (
          <p>No videos found for this topic. Try another topic.</p>
        )}

        
<section className="youtube-reels">
  {!loading &&
    videos.map((video) => (
      <article className="youtube-reel-card" key={video.videoId}>
        <div className="youtube-player">
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        </div>

        <div className="youtube-reel-details">
          <h3>{video.title}</h3>
          <p>{video.channelTitle}</p>
        </div>
      </article>
    ))}
</section>


      </main>
    </div>
  );
}

export default Reels;
