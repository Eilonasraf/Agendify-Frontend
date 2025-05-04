// src/pages/PromoteResultsPage.tsx
import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect }      from "react";
import "../styles/PromoteResults.css";

declare global {
  interface Window {
    twttr?: { widgets?: { load?: () => void } };
  }
}

type TweetIn = {
  id: string;
  text: string;
  responseComment?: any;
};

type LocationState = {
  tweets?:     TweetIn[];
  agendaTitle?: string;
  prompt?:      string;
  agendaId?:    string;
};

export default function PromoteResultsPage() {
  const { state } = useLocation();
  // - make sure tweets is always an array
  const tweets: TweetIn[] = Array.isArray(state?.tweets) ? state!.tweets! : [];
  const agendaTitle      = state?.agendaTitle  ?? "";
  const prompt           = state?.prompt       ?? "";
  const agendaId         = state?.agendaId     ?? "";

  const navigate = useNavigate();
  const [editedTweets, setEditedTweets] = useState(
    [] as { id: string; text: string; editedComment: string; liked: boolean }[]
  );
  const [message, setMessage] = useState<string|null>(null);

  // helper to unwrap AI response shapes
  function unwrap(r: any): string {
    if (!r) return "";
    if (typeof r === "string") return r;
    if (r.comment !== undefined) return unwrap(r.comment);
    const firstString = Object.values(r).find((v) => typeof v === "string");
    return unwrap(firstString);
  }

  // 1) inject Twitter widgets.js ONCE
  useEffect(() => {
    if (!window.twttr) {
      const s = document.createElement("script");
      s.src     = "https://platform.twitter.com/widgets.js";
      s.async   = true;
      s.charset = "utf-8";
      document.body.appendChild(s);
    }
  }, []);

  // 2) map incoming tweets → local state
  useEffect(() => {
    setEditedTweets(
      tweets.map((t) => ({
        id:            t.id,
        text:          t.text,
        editedComment: unwrap(t.responseComment),
        liked:         false,
      }))
    );
  }, [tweets]);

  // 3) whenever our list changes, re‐run the Twitter embed parser
  useEffect(() => {
    // Timeout ensures DOM is ready before widget parsing
    const timer = setTimeout(() => {
      if (window.twttr?.widgets?.load) {
        window.twttr.widgets.load();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [editedTweets]);

  // toggle heart
  const toggleLike = (i: number) =>
    setEditedTweets((prev) => {
      const c = [...prev];
      c[i].liked = !c[i].liked;
      return c;
    });

  // edit reply
  const handleChange = (i: number, v: string) =>
    setEditedTweets((prev) => {
      const c = [...prev];
      c[i].editedComment = v;
      return c;
    });

  // back to form
  const goBack = () => navigate(`/clusters/${agendaId}/promote`);

  // post everything
  const handlePostAllReplies = async () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!agendaId || !user._id) {
      setMessage("❌ Missing agendaId or login.");
      return;
    }
    try {
      const payload = {
        agendaId,
        twitterUserId: user._id,
        tweets: editedTweets.map((t) => ({
          id:              t.id,
          responseComment: t.editedComment,
        })),
      };
      const resp = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/twitter/postToX`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(payload),
        }
      );
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || resp.statusText);
      }
      setMessage("✅ All replies posted! Redirecting…");
      setTimeout(() => navigate(`/clusters/${agendaId}`), 800);
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    }
  };

  if (!editedTweets.length) {
    return (
      <div className="results-container">
        <h2>No tweets found 😢</h2>
        <button onClick={goBack}>🔄 Start New Promotion</button>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h1>🎯 “{agendaTitle}”</h1>
      <p className="prompt">Prompt: {prompt}</p>
      <button onClick={goBack}>🔄 Start New Promotion</button>

      <table className="results-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Tweet</th>
            <th>Like?</th>
            <th>Your Reply</th>
          </tr>
        </thead>
        <tbody>
          {editedTweets.map((t, idx) => (
            <tr key={`${t.id}-${idx}`}>
              <td>{idx + 1}</td>
              <td>
                <blockquote className="twitter-tweet">
                  <a href={`https://twitter.com/ffff/status/${t.id}`}>Loading tweet…</a>
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
                  className="reply-textarea"
                  value={t.editedComment}
                  onChange={(e) => handleChange(idx, e.target.value)}
                />
              </td>
            </tr>
          ))}
      </tbody>
      </table>

      <button onClick={handlePostAllReplies}>📤 Post All Replies</button>
      {message && <p className="status">{message}</p>}
    </div>
  );
}
