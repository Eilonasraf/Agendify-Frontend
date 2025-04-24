import { useLocation } from "react-router-dom";
import { useState } from "react";
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
};

const PromoteResultsPage = () => {
  const location = useLocation();
  const state = location.state as LocationState;
  const tweets = state?.tweets || [];

  const [editedTweets, setEditedTweets] = useState<Tweet[]>(
    tweets.map((tweet) => ({
      ...tweet,
      editedComment: tweet.responseComment || "",
      liked: false,
    }))
  );

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
      } else {
        alert("Failed to post: " + result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      alert("Error posting reply: " + errorMessage);
    }
  };

  if (!tweets.length) {
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
                <TweetEmbed tweetId={tweet.id} />
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