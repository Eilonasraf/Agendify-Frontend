import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TweetEmbed from "../components/TweetEmbed";
import "../styles/PromoteResults.css";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

type Tweet = {
  id: string;
  text: string;
  responseComment?: string;
  editedComment?: string;
  liked?: boolean;
};

type LocationState = {
  tweets: {
    tweets: Tweet[];
    message?: string;
  };
  topic: string;
};

export default function PromoteResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const locationState = location.state as LocationState | null;

  // current userId
  let currentUserId = "";
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      currentUserId = u._id || "";
    }
  } catch {}

  const topic = locationState?.topic || "Unknown Topic";
  const [editedTweets, setEditedTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const resp = locationState?.tweets;
    const arr: Tweet[] = resp?.tweets ?? [];
    setEditedTweets(
      arr.map((t) => ({
        ...t,
        editedComment: t.responseComment || "",
        liked: false,
      }))
    );
    setLoading(false);
  }, [locationState]);

  const handleEditChange = (index: number, value: string) => {
    const updated = [...editedTweets];
    updated[index].editedComment = value;
    setEditedTweets(updated);
  };

  const toggleLike = (index: number) => {
    const updated = [...editedTweets];
    updated[index].liked = !updated[index].liked;
    setEditedTweets(updated);
  };

  const handlePostAllReplies = async () => {
    try {
      // send the full JSON object as received, plus user ID

      await fetch(`${API_BASE}/twitter/postToX`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tweets: locationState!.tweets.tweets,
          twitterUserId: currentUserId,
        }),
      });

    } catch (err) {
      alert(`❌ Failed to post replies: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const handleClearResults = () => {
    localStorage.removeItem("promoteResults");
    navigate("/promote-form");
  };

  if (loading) {
    return (
      <div className="tweet-loader">
        <div className="spinner"></div>
        <p>Loading tweets...</p>
      </div>
    );
  }

  if (!editedTweets.length) {
    return (
      <div className="results-container text-center">
        <h2>No tweets found 😢</h2>
        <p>Try submitting a promotion again.</p>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h1 className="results-title">🎯 Results - Based On My Selected Agenda</h1>
      <div className="results-actions">
        <button className="clear-button" onClick={handleClearResults}>
          🔄 Start New Promotion
        </button>
      </div>

      <table className="results-table">
        <thead>
          <tr>
            <th>Num</th>
            <th>Tweet</th>
            <th>Like?</th>
            <th>Automatic Reply</th>
          </tr>
        </thead>
        <tbody>
          {editedTweets.map((tweet, index) => (
            <tr key={tweet.id}>
              <td>{index + 1}</td>
              <td>
                <div className="tweet-embed-wrapper">
                  <TweetEmbed tweetId={tweet.id} />
                  <p className="tweet-text">{tweet.text}</p>
                </div>
              </td>
              <td>
                <button
                  onClick={() => toggleLike(index)}
                  className={`like-button ${tweet.liked ? "liked" : "unliked"}`}
                >
                  {tweet.liked ? "❤️" : "🤍"}
                </button>
              </td>
              <td>
                <textarea
                  value={tweet.editedComment}
                  onChange={(e) => handleEditChange(index, e.target.value)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="results-actions">
        <button className="post-button" onClick={handlePostAllReplies}>
          📤 Post All Replies to X
        </button>
      </div>
    </div>
  );
}