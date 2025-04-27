import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import TweetEmbed from "../components/TweetEmbed";
import "../styles/PromoteResults.css";

type Tweet = {
  id: string;
  text: string;
  responseComment?: string;
  editedComment?: string;
  liked?: boolean;
};

type LocationState = {
  tweets: Tweet[];
  topic: string; // NEW: topic info
};

const PromoteResultsPage = () => {
  const location = useLocation();
  const locationState = location.state as LocationState | null;

  const [editedTweets, setEditedTweets] = useState<Tweet[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const topic = locationState?.topic || "Unknown Topic";

  useEffect(() => {
    let tweetsToLoad: Tweet[] = [];

    if (locationState?.tweets?.length) {
      tweetsToLoad = locationState.tweets;
      localStorage.setItem("promoteResults", JSON.stringify(locationState.tweets));
    } else {
      const stored = localStorage.getItem("promoteResults");
      if (stored) {
        tweetsToLoad = JSON.parse(stored);
      }
    }

    if (tweetsToLoad.length) {
      setEditedTweets(
        tweetsToLoad.map((tweet) => ({
          ...tweet,
          editedComment: tweet.responseComment || "",
          liked: false,
        }))
      );
    }
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

  const handlePostReply = async (tweet: Tweet) => {
    try {
      const response = await fetch(`/api/replies/${tweet.id}/replies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: tweet.editedComment }),
      });

      const result: { error?: string } = await response.json();
      if (response.ok) {
        alert("Reply posted!");

        // Save promoted reply to localStorage
        const stored = localStorage.getItem("promotedReplies");
        const promotedReplies = stored ? JSON.parse(stored) : [];

        promotedReplies.push({
          tweetId: tweet.id,
          topic: topic,
        });

        localStorage.setItem("promotedReplies", JSON.stringify(promotedReplies));
      } else {
        alert("Failed to post: " + result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert("Error posting reply: " + errorMessage);
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
            <th>Promote</th>
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
              <td>
                <button
                  onClick={() => handlePostReply(tweet)}
                  className="promote-button"
                >
                  Promote
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PromoteResultsPage;