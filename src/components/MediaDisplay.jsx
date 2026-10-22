
import { useEffect, useState } from "react";

function MediaDisplay({ fileId, mediaType }) {
  const [mediaUrl, setMediaUrl] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!fileId) return;

    let objectUrl;

    async function loadMedia() {
      try {
        setError(false);

        const token = sessionStorage.getItem("studygramToken");

        const response = await fetch(
          `http://localhost:5000/api/posts/media/${fileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Unable to load media.");
        }

        const blob = await response.blob();
        objectUrl = URL.createObjectURL(blob);
        setMediaUrl(objectUrl);
      } catch {
        setError(true);
      }
    }

    loadMedia();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileId]);

  if (error) {
    return <p>Unable to load this media file.</p>;
  }

  if (!mediaUrl) {
    return <p>Loading media...</p>;
  }

  return (
    <div className="post-media">
      {mediaType === "video" ? (
        <video src={mediaUrl} controls preload="metadata" />
      ) : (
        <img
          src={mediaUrl}
          alt="Shared on StudyGram"
          loading="lazy"
        />
      )}
    </div>
  );
}

export default MediaDisplay;
