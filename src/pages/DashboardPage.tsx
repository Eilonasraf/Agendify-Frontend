import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import TweetEmbed from "../components/TweetEmbed";
import "../styles/dashboard.css";

interface PromotedReply {
  tweetId: string;
  topic: string;
}

const DashboardPage = () => {
  const { user } = useAuth();
  const [promotedReplies, setPromotedReplies] = useState<PromotedReply[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("promotedReplies");
    if (stored) {
      setPromotedReplies(JSON.parse(stored));
    }
  }, []);

  // Group replies by topic
  const groupedReplies: Record<string, PromotedReply[]> = {};
  promotedReplies.forEach((reply) => {
    if (!groupedReplies[reply.topic]) {
      groupedReplies[reply.topic] = [];
    }
    groupedReplies[reply.topic].push(reply);
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome back{user ? `, ${user.username}` : ""}!</h1>
        <p className="dashboard-subtitle">Your promoted tweets overview</p>
      </div>

      {Object.keys(groupedReplies).length === 0 ? (
        <p>No promoted tweets yet! 🚀</p>
      ) : (
        Object.entries(groupedReplies).map(([topic, replies]) => (
          <div key={topic} className="topic-section">
            <h2 className="topic-title">📚 {topic}</h2>
            <div className="tweet-grid">
              {replies.map((reply) => (
                <div key={reply.tweetId} className="tweet-card">
                  <TweetEmbed tweetId={reply.tweetId} />
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default DashboardPage;