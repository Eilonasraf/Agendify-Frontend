import { useAuth } from "../context/AuthContext";
import "../styles/profile.css";

const ProfilePage = () => {
  const { user } = useAuth();
  const currentTime = new Date().toLocaleString();

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={user?.profilePicture || "/default-avatar.png"}
          alt="Profile"
          className="profile-picture"
        />
        <h2 className="profile-title">
          👋 Welcome{user ? `, ${user.username}` : ""}!
        </h2>
        <p className="profile-text">
          This is your personal Agendify Profile.
        </p>
        <p className="profile-timestamp">🕒 Logged in at: {currentTime}</p>
      </div>
    </div>
  );
};

export default ProfilePage;