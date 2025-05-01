import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/PromoteResults.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

type TweetIn = {
  id: string;
  responseComment?: any;  // we’ll safely unwrap it
};

type LocalTweet = {
  id: string;
  editedComment: string;
  liked: boolean;
};

type LocationState = {
  tweets: { tweets: TweetIn[] };
  topic: string;
};

export default function PromoteResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { tweets: navTweets, topic } =
    (location.state as LocationState) || {
      tweets: { tweets: [] },
      topic: "",
    };

  // robust recursive unwrap
  const unwrap = (r: any): string => {
    if (r == null) return "";
    if (typeof r === "string") return r;
    if (r.comment !== undefined) return unwrap(r.comment);
    const val = Object.values(r)[0];
    return unwrap(val);
  };

  // 1) load Twitter embed script
  useEffect(() => {
    if (!(window as any).twttr) {
      const s = document.createElement("script");
      s.src = "https://platform.twitter.com/widgets.js";
      s.async = true;
      s.charset = "utf-8";
      document.body.appendChild(s);
    }
  }, []);

  // 2) seed our local tweets state
  const [editedTweets, setEditedTweets] = useState<LocalTweet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setEditedTweets(
      navTweets.tweets.map((t) => ({
        id: t.id,
        editedComment: unwrap(t.responseComment),
        liked: false,
      }))
    );
    setLoading(false);
  }, [navTweets]);

  // 3) re-run Twitter’s embed parser
  useEffect(() => {
    window.twttr?.widgets?.load?.();
  }, [editedTweets]);

  const toggleLike = (i: number) => {
    const c = [...editedTweets];
    c[i].liked = !c[i].liked;
    setEditedTweets(c);
  };
  const handleChange = (i: number, v: string) => {
    const c = [...editedTweets];
    c[i].editedComment = v;
    setEditedTweets(c);
  };
  const handleClear = () => navigate("/promote-form");

  // 4) post back, sending editedComment as responseComment
  const handlePostAllReplies = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const payload = {
      twitterUserId: user._id,
      tweets: editedTweets.map((t) => ({
        id: t.id,
        responseComment: t.editedComment,
      })),
    };
    try {
      await fetch(`${API_BASE}/twitter/postToX`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      alert("✅ Posted all replies!");
    } catch (err) {
      alert(`❌ Failed: ${err}`);
    }
  };

  if (loading) return <p>Loading tweets…</p>;
  if (!editedTweets.length)
    return (
      <div>
        <h2>No tweets found 😢</h2>
        <button onClick={handleClear}>🔄 Start New Promotion</button>
      </div>
    );

  return (
    <div className="results-container">
      <h1>🎯 Results – Based On “{topic}”</h1>
      <button onClick={handleClear}>🔄 Start New Promotion</button>
      <table className="results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tweet</th>
            <th>Like?</th>
            <th>Automatic Reply</th>
          </tr>
        </thead>
        <tbody>
          {editedTweets.map((t, idx) => (
            <tr key={t.id}>
              <td>{idx + 1}</td>
              <td>
                <blockquote className="twitter-tweet">
                  <a href={`https://twitter.com/ffff/status/${t.id}`}></a>
                </blockquote>
              </td>
              <td>
                <span
                  className="like-icon"
                  onClick={() => toggleLike(idx)}
                >
                  {t.liked ? "❤️" : "🤍"}
                </span>
              </td>
              <td>
                <textarea
                  value={t.editedComment}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  className="reply-textarea"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={handlePostAllReplies}>📤 Post All Replies</button>
    </div>
  );
}
