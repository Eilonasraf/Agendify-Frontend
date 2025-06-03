import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/PromoteResults.css";

declare global {
  interface Window {
    twttr?: { widgets?: { load?: () => void } };
  }
}

type TweetIn = {
  id: string;
  text: string;
  responseComment?: string | { comment?: string } | Record<string, unknown>;
};

export default function PromoteResultsPage() {
  const { state } = useLocation();
  const tweets: TweetIn[] = Array.isArray(state?.tweets) ? state!.tweets! : [];
  const agendaTitle = state?.agendaTitle ?? "";
  const prompt = state?.prompt ?? "";
  const agendaId = state?.agendaId ?? "";

  const navigate = useNavigate();
  const [editedTweets, setEditedTweets] = useState(
    [] as {
      id: string;
      text: string;
      editedComment: string;
      liked: boolean;
      editing: boolean;
    }[]
  );
  const [message, setMessage] = useState<string | null>(null);

  function unwrap(
    r:
      | string
      | { comment?: unknown }
      | Record<string, unknown>
      | null
      | undefined
  ): string {
    if (!r) return "";
    if (typeof r === "string") return r;
    if (r.comment !== undefined) return unwrap(r.comment);
    const firstString = Object.values(r).find((v) => typeof v === "string");
    return unwrap(firstString);
  }

  useEffect(() => {
    if (!window.twttr) {
      const s = document.createElement("script");
      s.src = "https://platform.twitter.com/widgets.js";
      s.async = true;
      s.charset = "utf-8";
      document.body.appendChild(s);
    }
  }, []);

  useEffect(() => {
    setEditedTweets(
      tweets.map((t) => ({
        id: t.id,
        text: t.text,
        editedComment: unwrap(t.responseComment),
        liked: false,
        editing: false,
      }))
    );
  }, [tweets]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.twttr?.widgets?.load) {
        window.twttr.widgets.load();
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [editedTweets]);

  const toggleLike = (i: number) =>
    setEditedTweets((prev) => {
      const c = [...prev];
      c[i].liked = !c[i].liked;
      return c;
    });

  const handleEdit = (i: number) =>
    setEditedTweets((prev) => {
      const c = [...prev];
      c[i].editing = true;
      return c;
    });

  const handleSave = (i: number) =>
    setEditedTweets((prev) => {
      const c = [...prev];
      c[i].editing = false;
      return c;
    });

  const handleChange = (i: number, v: string) =>
    setEditedTweets((prev) => {
      const c = [...prev];
      c[i].editedComment = v;
      return c;
    });

  const goBack = () => navigate(`/agendas/${agendaId}/promote`);

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
          id: t.id,
          responseComment: t.editedComment,
        })),
      };
      const resp = await fetch(
        `${
          import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"
        }/twitter/postToX`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || resp.statusText);
      }
      setMessage("✅ All replies posted! Redirecting…");
      setTimeout(() => navigate(`/agendas/${agendaId}`), 800);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setMessage(`❌ ${err.message}`);
      } else {
        setMessage("❌ An unknown error occurred.");
      }
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
        <colgroup>
          <col style={{ width: "5%" }} />
          <col style={{ width: "45%" }} />
          <col style={{ width: "5%" }} />
          <col style={{ width: "45%" }} />
        </colgroup>
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
                  <a href={`https://twitter.com/ffff/status/${t.id}`}>
                    Loading tweet…
                  </a>
                </blockquote>
              </td>
              <td>
                <span className="like-icon" onClick={() => toggleLike(idx)}>
                  {t.liked ? "❤️" : "🤍"}
                </span>
              </td>
              <td>
                {!t.editedComment?.trim() ? (
                  <em style={{ color: "gray" }}>
                    No comment generated by the AI.
                  </em>
                ) : t.editing ? (
                  <>
                    <textarea
                      className="reply-textarea"
                      value={t.editedComment}
                      onChange={(e) => handleChange(idx, e.target.value)}
                    />
                    <div>
                      <button onClick={() => handleSave(idx)}>💾 Save</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div>{t.editedComment}</div>
                    <div style={{ marginTop: "0.5rem" }}>
                      <button onClick={() => handleEdit(idx)}>✏️ Edit</button>
                    </div>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="post-replies-wrapper">
        <button className="post-replies-button" onClick={handlePostAllReplies}>
          📤 Post All Replies
        </button>
        {message && <p className="status">{message}</p>}
      </div>
    </div>
  );
}
