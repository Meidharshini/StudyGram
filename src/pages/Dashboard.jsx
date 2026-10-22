
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const savedUser = sessionStorage.getItem("studygramUser");
  const user = savedUser ? JSON.parse(savedUser) : null;

  function handleLogout() {
    sessionStorage.removeItem("studygramToken");
    sessionStorage.removeItem("studygramUser");
    navigate("/login");
  }

  return (
    <div className="dashboard-page">
      
<header className="dashboard-header">
  <h2>StudyGram</h2>

  <div className="dashboard-actions">
    <button onClick={() => navigate("/profile")}>
      My Profile
    </button>


<button onClick={() => navigate("/feed")}>
  Learning Feed
</button>


    <button onClick={handleLogout}>Logout</button>
  </div>
</header>


      <main className="dashboard-content">
        <h1>
          Welcome, {user?.fullName || "Learner"}!
        </h1>

        <p>
          Your learning journey starts here.
        </p>

        <div className="dashboard-grid">
          <div
  className="dashboard-card"
  onClick={() => navigate("/study-materials")}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate("/study-materials");
    }
  }}
>
  <h3>📚 Study Materials</h3>
  <p>Access and share learning resources.</p>
</div>

          
<div
  className="dashboard-card"
  onClick={() => navigate("/reels")}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate("/reels");
    }
  }}
>
  <h3>🎬 Reels</h3>
  <p>Learn through short educational videos.</p>
</div>


          
<div
  className="dashboard-card"
  onClick={() => navigate("/quiz")}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate("/quiz");
    }
  }}
>
  <h3>📝 Quizzes</h3>
  <p>Test your knowledge and improve.</p>
</div>


          
<div
  className="dashboard-card"
  onClick={() => navigate("/doubts")}
  role="button"
  tabIndex={0}
  onKeyDown={(event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate("/doubts");
    }
  }}
>
  <h3>💬 Doubts</h3>
  <p>Share doubts, explore student stories, and help others learn.</p>
</div>

        </div>

        <p className="dashboard-role">
          Account type: {user?.role || "User"}
        </p>
      </main>
    </div>
  );
}

export default Dashboard;
