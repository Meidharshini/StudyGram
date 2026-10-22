
import { useNavigate } from "react-router-dom";
import "./Doubts.css";
import { useEffect, useState } from "react";
function Doubts() {
  const navigate = useNavigate();


const [showDoubtForm, setShowDoubtForm] = useState(false);
const [doubtTitle, setDoubtTitle] = useState("");
const [doubtTopic, setDoubtTopic] = useState("Java");
const [doubtDescription, setDoubtDescription] = useState("");

const [doubts, setDoubts] = useState([]);
const [loading, setLoading] = useState(true);
const [errorMessage, setErrorMessage] = useState("");


const [selectedDoubt, setSelectedDoubt] = useState(null);
const [replies, setReplies] = useState([]);
const [replyMessage, setReplyMessage] = useState("");



const openDoubt = async (doubt) => {
  setSelectedDoubt(doubt);
  setReplies([]);
  setReplyMessage("");
  setErrorMessage("");

  try {
    const response = await fetch(
      `http://localhost:5000/api/doubts/${doubt._id}/replies`
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to load replies.");
    }

    setReplies(data);
  } catch (error) {
    setErrorMessage(error.message || "Unable to load replies.");
  }
};



const submitReply = async (event) => {
  event.preventDefault();

  if (!selectedDoubt || !replyMessage.trim()) {
    return;
  }

  setErrorMessage("");

  try {
    const token = sessionStorage.getItem("studygramToken");

    if (!token) {
      throw new Error("Please log in again to reply.");
    }

    const response = await fetch(
      `http://localhost:5000/api/doubts/${selectedDoubt._id}/replies`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          message: replyMessage.trim(),
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Failed to post reply.");
    }

    setReplies((previousReplies) => [...previousReplies, data]);
    setReplyMessage("");
  } catch (error) {
    setErrorMessage(error.message || "Unable to post reply.");
  }
};




useEffect(() => {
  const fetchDoubts = async () => {
    try {
      setLoading(true);
      setErrorMessage("");

      const response = await fetch("http://localhost:5000/api/doubts");

      if (!response.ok) {
        throw new Error("Failed to load doubts.");
      }

      const data = await response.json();
      setDoubts(data);
    } catch (error) {
      setErrorMessage(error.message || "Unable to load doubts.");
    } finally {
      setLoading(false);
    }
  };

  fetchDoubts();
}, []);


  const savedUser = sessionStorage.getItem("studygramUser");
  const user = savedUser ? JSON.parse(savedUser) : null;

  return (
    <div className="doubts-page">
      <header className="doubts-header">
        <button
          className="doubts-back-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <h2>StudyGram</h2>
        <span>Doubt Community 💬</span>
      </header>

      <main className="doubts-content">
        <h1>Learn Together 💜</h1>
        <p className="doubts-subtitle">
          Share your doubts. Help someone grow.
        </p>

        <section className="doubt-stories">
          <button
            className="doubt-story"
           onClick={() => setShowDoubtForm(true)}
          >
            <span className="story-ring add-story">
              <span className="story-avatar">+</span>
            </span>
            <span className="story-name">Your doubt</span>
          </button>

          <div className="doubt-story">
            <span className="story-ring">
              <span className="story-avatar">A</span>
            </span>
            <span className="story-name">Arun</span>
          </div>

          <div className="doubt-story">
            <span className="story-ring">
              <span className="story-avatar">P</span>
            </span>
            <span className="story-name">Priya</span>
          </div>

          <div className="doubt-story">
            <span className="story-ring">
              <span className="story-avatar">K</span>
            </span>
            <span className="story-name">Kavin</span>
          </div>
        </section>




        
{showDoubtForm && (
  <section className="doubt-form">
    <h2>Share your doubt 💬</h2>

    <form   
      onSubmit={async (event) => {
        event.preventDefault();

        if (!doubtTitle.trim() || !doubtDescription.trim()) {
          return;
        }

        
setErrorMessage("");

try {
  const token = sessionStorage.getItem("studygramToken");

  if (!token) {
    throw new Error("Please log in again to post a doubt.");
  }

  const response = await fetch("http://localhost:5000/api/doubts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: doubtTitle.trim(),
      topic: doubtTopic,
      description: doubtDescription.trim(),
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to post your doubt.");
  }

  setDoubts((previousDoubts) => [data, ...previousDoubts]);
  setShowDoubtForm(false);
  setDoubtTitle("");
  setDoubtTopic("Java");
  setDoubtDescription("");
} catch (error) {
  setErrorMessage(error.message || "Unable to post your doubt.");
}

      }}
    >
      <label htmlFor="doubt-title">Question title</label>
      <input
        id="doubt-title"
        value={doubtTitle}
        onChange={(event) => setDoubtTitle(event.target.value)}
        placeholder="e.g. What is method overloading?"
        required
      />

      <label htmlFor="doubt-topic">Topic</label>
      <select
        id="doubt-topic"
        value={doubtTopic}
        onChange={(event) => setDoubtTopic(event.target.value)}
      >
        <option>Java</option>
        <option>Python</option>
        <option>SQL</option>
        <option>Web Development</option>
        <option>Data Structures and Algorithms</option>
        <option>Aptitude</option>
        <option>Other</option>
      </select>

      <label htmlFor="doubt-description">Explain your doubt</label>
      <textarea
        id="doubt-description"
        value={doubtDescription}
        onChange={(event) => setDoubtDescription(event.target.value)}
        placeholder="Describe what you are stuck on..."
        rows={4}
        required
      />

      <div className="doubt-form-actions">
        <button type="submit">Post Doubt</button>
        <button
          type="button"
          onClick={() => setShowDoubtForm(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  </section>
)}


       
<section className="doubts-feed">
  <h2>Recent Doubts</h2>

  {errorMessage && (
    <p className="doubt-error">{errorMessage}</p>
  )}

  {loading ? (
    <p>Loading doubts...</p>
  ) : doubts.length === 0 ? (
    <p>No doubts yet. Be the first to share a question! 💜</p>
  ) : (
    doubts.map((doubt) => (
      <article
  className="doubt-post"
  key={doubt._id}
  onClick={() => openDoubt(doubt)}
>
        <div className="doubt-post-user">
          <span className="doubt-user-avatar">
            {doubt.author?.fullName?.charAt(0)?.toUpperCase() || "S"}
          </span>

          <div>
            <h3>{doubt.author?.fullName || "Student"}</h3>
            <span>{doubt.topic}</span>
          </div>
        </div>

        <h3>{doubt.title}</h3>
        <p>{doubt.description}</p>

        <div className="doubt-post-footer">
          <span>💬 {doubt.replies?.length || 0} replies · View discussion →</span>
        </div>
      </article>
    ))
  )}
</section>


{selectedDoubt && (
  <section className="doubt-discussion">
    <div className="discussion-header">
      <div>
        <h2>💬 Discussion</h2>
        <p>{selectedDoubt.title}</p>
      </div>

      <button
        type="button"
        onClick={() => {
          setSelectedDoubt(null);
          setReplies([]);
          setReplyMessage("");
          setErrorMessage("");
        }}
      >
        Close ✕
      </button>
    </div>

    <div className="discussion-question">
      <span>Topic: {selectedDoubt.topic}</span>
      <p>{selectedDoubt.description}</p>
    </div>

    <h3>Student Replies ({replies.length})</h3>

    {replies.length === 0 ? (
      <p>No replies yet. Be the first to help! 💜</p>
    ) : (
      replies.map((reply) => (
        <article className="doubt-reply" key={reply._id}>
          <div className="reply-author">
            <span className="doubt-user-avatar">
              {reply.author?.fullName?.charAt(0)?.toUpperCase() || "S"}
            </span>
            <strong>{reply.author?.fullName || "Student"}</strong>
          </div>

          <p>{reply.message}</p>
        </article>
      ))
    )}

    <form className="reply-form" onSubmit={submitReply}>
      <label htmlFor="reply-message">Your explanation</label>

      <textarea
        id="reply-message"
        value={replyMessage}
        onChange={(event) => setReplyMessage(event.target.value)}
        placeholder="Share your answer or explain the concept..."
        rows={3}
        required
      />

      <button type="submit">Post Reply 💜</button>
    </form>
  </section>
)}


      </main>
    </div>
  );
}

export default Doubts;
