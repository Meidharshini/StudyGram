
import { Link } from "react-router-dom";
import "./Profile.css";

function Profile() {
  const savedUser = sessionStorage.getItem("studygramUser");
  const user = savedUser ? JSON.parse(savedUser) : null;

  if (!user) {
    return (
      <div className="profile-page">
        <h2>User profile not found</h2>
        <Link to="/login">Login again</Link>
      </div>
    );
  }

  const initials = user.fullName
    .trim()
    .split(/\s+/)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-card">
        <Link to="/dashboard" className="profile-back">
          ← Back to Dashboard
        </Link>

        <div className="profile-avatar">{initials}</div>

        <h1>{user.fullName}</h1>
        <p className="profile-subtitle">Welcome to your StudyGram profile!</p>

        <div className="profile-details">
          <div className="profile-detail">
            <span>Full Name</span>
            <strong>{user.fullName}</strong>
          </div>

          <div className="profile-detail">
            <span>Email Address</span>
            <strong>{user.email}</strong>
          </div>

          <div className="profile-detail">
            <span>Account Type</span>
            <strong>{user.role}</strong>
          </div>
        </div>

        <p className="profile-note">
          Your learning journey, all in one place.
        </p>
      </div>
    </div>
  );
}

export default Profile;
