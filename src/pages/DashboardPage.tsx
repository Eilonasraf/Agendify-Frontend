import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import "../styles/dashboard.css";

const DashboardPage = () => {
  const { user } = useAuth();
  const currentTime = new Date().toLocaleString();

  const backend_url = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:4040";

  const getImageUrl = (url: string | undefined) => {
    if (!url) return "/default-avatar.png";
    if (url.startsWith("http")) return url;

    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    return `${backend_url}${cleanPath}`;
  };

  useEffect(() => {
    // Optional side effect here for usage in the future
  }, [user]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        {user?.profilePicture && (
          <img
            src={getImageUrl(user.profilePicture)}
            alt="Profile"
            className="dashboard-profile-picture"
          />
        )}

        <h2 className="dashboard-title">👋 Welcome{user ? `, ${user.username}` : ""}!</h2>
        <p className="dashboard-text">This is your personal Agendify dashboard.</p>
        <p className="dashboard-timestamp">🕒 Logged in at: {currentTime}</p>
      </div>
    </div>
  );
};

export default DashboardPage;