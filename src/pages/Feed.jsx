
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Feed.css";

import MediaDisplay from "../components/MediaDisplay";

function Feed() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");


const [selectedMedia, setSelectedMedia] = useState(null);
const [mediaPreview, setMediaPreview] = useState("");


  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);

  const [likingPostId, setLikingPostId] = useState(null);

  const [commentInputs, setCommentInputs] = useState({});
const [commentingPostId, setCommentingPostId] = useState(null);





  const token = sessionStorage.getItem("studygramToken");
  const currentUser = JSON.parse(
    sessionStorage.getItem("studygramUser") || "null"
  );

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to load posts.");
      }

      setPosts(data.posts);
      setMessage("");
    } catch (error) {
      setMessage(error.message || "Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);





function handleMediaChange(event) {
  const file = event.target.files?.[0];

  if (!file) return;

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "video/quicktime",
  ];

  if (!allowedTypes.includes(file.type)) {
    setMessage("Please select a JPG, PNG, WEBP, MP4, WEBM, or MOV file.");
    event.target.value = "";
    return;
  }

  if (file.size > 50 * 1024 * 1024) {
    setMessage("The file must be smaller than 50 MB.");
    event.target.value = "";
    return;
  }

  setMessage("");
  setSelectedMedia(file);
  setMediaPreview(URL.createObjectURL(file));
}




  
async function handleSubmit(event) {
  event.preventDefault();

  if (!content.trim() && !selectedMedia) {
    setMessage("Write something or attach an image or video.");
    return;
  }

  try {
    setPosting(true);
    setMessage("");

    const formData = new FormData();
    formData.append("content", content);

    if (selectedMedia) {
      formData.append("media", selectedMedia);
    }

    const response = await fetch("http://localhost:5000/api/posts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to publish your post.");
    }

    setPosts((previousPosts) => [data.post, ...previousPosts]);
    setContent("");
    setSelectedMedia(null);
    setMediaPreview("");

    const mediaInput = document.getElementById("post-media");
    if (mediaInput) mediaInput.value = "";

    setMessage("Post published successfully!");
  } catch (error) {
    setMessage(error.message || "Unable to connect to the server.");
  } finally {
    setPosting(false);
  }
}

   



async function handleLike(postId) {
  try {
    setLikingPostId(postId);
    setMessage("");

    const response = await fetch(
      `http://localhost:5000/api/posts/${postId}/like`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to update like.");
    }

    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post._id === postId
          ? { ...post, likes: data.likes }
          : post
      )
    );


    
  } catch (error) {
    setMessage(error.message || "Unable to update like.");
  } finally {
    setLikingPostId(null);
  }
}




async function handleComment(postId) {
  const content = (commentInputs[postId] || "").trim();

  if (!content) {
    setMessage("Please write a comment.");
    return;
  }

  try {
    setCommentingPostId(postId);
    setMessage("");

    const response = await fetch(
      `http://localhost:5000/api/posts/${postId}/comments`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to add comment.");
    }

    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post._id === postId
          ? {
              ...post,
              comments: [...(post.comments || []), data.comment],
            }
          : post
      )
    );

    setCommentInputs((previous) => ({
      ...previous,
      [postId]: "",
    }));

    setMessage("Comment added successfully!");
  } catch (error) {
    setMessage(error.message || "Unable to add comment.");
  } finally {
    setCommentingPostId(null);
  }
}





  function formatDate(date) {
    return new Date(date).toLocaleString([], {
      dateStyle: "medium",
      timeStyle: "short",
    });
  }

  return (
    <div className="feed-page">
      <header className="feed-header">
        <Link to="/dashboard" className="feed-brand">
          StudyGram
        </Link>

        <nav>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/profile">My Profile</Link>
        </nav>
      </header>

      <main className="feed-container">
        <section className="composer-card">
          <h1>Learning Community</h1>
          <p>Share what you're learning, ask questions, or post study notes.</p>

          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={(event) => setContent(event.target.value)}
              placeholder={`What's on your mind${currentUser?.fullName ? `, ${currentUser.fullName}` : ""}?`}
              maxLength={2000}
              rows={4}
              required
            />


            
<div className="media-picker">
  <label htmlFor="post-media">
    📷 Choose Image or Video
  </label>

  <input
    id="post-media"
    type="file"
    accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
    onChange={handleMediaChange}
  />

  {selectedMedia && (
    <div className="media-preview">
      <p>Selected: {selectedMedia.name}</p>

      {selectedMedia.type.startsWith("image/") ? (
        <img src={mediaPreview} alt="Selected upload preview" />
      ) : (
        <video src={mediaPreview} controls />
      )}

      <button
        type="button"
        onClick={() => {
          setSelectedMedia(null);
          setMediaPreview("");
          const input = document.getElementById("post-media");
          if (input) input.value = "";
        }}
      >
        Remove Media
      </button>
    </div>
  )}
</div>


            <div className="composer-footer">
              <span>{content.length}/2000</span>

              <button type="submit" disabled={posting || (!content.trim() && !selectedMedia)}>
                {posting ? "Publishing..." : "Publish Post"}
              </button>
            </div>
          </form>
        </section>

        {message && (
          <p className="feed-message" role="status">
            {message}
          </p>
        )}

        <section className="posts-section">
          <h2>Recent Posts</h2>

          {loading ? (
            <p>Loading posts...</p>
          ) : posts.length === 0 ? (
            <div className="empty-feed">
              <h3>Your feed starts here!</h3>
              <p>Be the first to share something with your learning community.</p>
            </div>
          ) : (
            posts.map((post) => (
              <article className="post-card" key={post._id}>
                <div className="post-author">
                  <div className="post-avatar">
                    {post.author?.fullName?.charAt(0)?.toUpperCase() || "U"}
                  </div>

                  <div>
                    <strong>{post.author?.fullName || "StudyGram User"}</strong>
                    <span>
                      {post.author?.role || "Member"} ·{" "}
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>

                
<p className="post-content">{post.content}</p>



{post.mediaFileId && (
  <MediaDisplay
    fileId={post.mediaFileId}
    mediaType={post.mediaType}
  />
)}

<div className="post-actions">
  <button
    type="button"
    className={
      post.likes?.includes(currentUser?.id)
        ? "like-button liked"
        : "like-button"
    }
    onClick={() => handleLike(post._id)}
    disabled={likingPostId === post._id}
  >
    {post.likes?.includes(currentUser?.id) ? "♥ Liked" : "♡ Like"}
    {" "}({post.likes?.length || 0})
  </button>
</div>

<div className="comments-section">
  <h4>Comments ({post.comments?.length || 0})</h4>

  {(post.comments || []).map((comment) => (
    <div className="comment-item" key={comment._id}>
      <strong>
        {comment.author?.fullName || "StudyGram User"}
      </strong>

      <p>{comment.content}</p>

      <span>
        {comment.createdAt
          ? new Date(comment.createdAt).toLocaleString()
          : ""}
      </span>
    </div>
  ))}

  <form
    className="comment-form"
    onSubmit={(event) => {
      event.preventDefault();
      handleComment(post._id);
    }}
  >
    <input
      type="text"
      value={commentInputs[post._id] || ""}
      onChange={(event) =>
        setCommentInputs((previous) => ({
          ...previous,
          [post._id]: event.target.value,
        }))
      }
      placeholder="Write a comment..."
      maxLength={500}
      aria-label="Write a comment"
    />

    <button
      type="submit"
      disabled={
        commentingPostId === post._id ||
        !(commentInputs[post._id] || "").trim()
      }
    >
      {commentingPostId === post._id ? "Sending..." : "Comment"}
    </button>
  </form>
</div>

</article>



              
            ))
          )}
        </section>
      </main>
    </div>
  );
}

export default Feed;
