import { useState, FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/PromoteForm.css";

type LocationState = {
  agendaId?:    string;
  agendaTitle?: string;
};

export default function PromoteForm() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { agendaId, agendaTitle } = (state as LocationState) || {};
  const isAppend = Boolean(agendaId);

  const [prompt,     setPrompt]     = useState("");
  const [stance,     setStance]     = useState<"in_favor"|"opposed">("in_favor");
  const [tweetCount, setTweetCount] = useState(10);
  const [message,    setMessage]    = useState<string|null>(null);
  const [loading,    setLoading]    = useState(false);

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setMessage("❌ Prompt cannot be empty.");
      return;
    }
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user._id) {
      setMessage("❌ You must be logged in.");
      return;
    }

    setLoading(true);
    try {
      const body: any = {
        prompt:    prompt.trim(),
        stance,
        createdBy: user._id,
      };
      if (agendaId) body.agendaId = agendaId;

      const resp = await fetch(
        `${API_BASE}/twitter/promote?count=${tweetCount}`,
        {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify(body),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || resp.statusText);

      // ניווט עם מערך ישיר של TweetIn[]
      navigate(
        `/agendas/${agendaId || data.agendaId}/promote/results`,
        {
          state: {
            agendaId:    agendaId || data.agendaId,
            agendaTitle: agendaTitle || data.title,
            prompt:      prompt.trim(),
            tweets:      data.tweets,    // <– מערך של TweetIn[]
          },
        }
      );
    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="promote-form">
      <h2>{isAppend ? `Add Replies to “${agendaTitle}”` : "New Promotion"}</h2>
      {message && <div className="message">{message}</div>}

      <fieldset className="section">
        <legend>1. Your Prompt</legend>
        <textarea
          rows={3}
          placeholder="Type what you want to promote…"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
      </fieldset>

      <fieldset className="section">
        <legend>2. Stance</legend>
        <label>
          <input
            type="radio"
            name="stance"
            value="in_favor"
            checked={stance === "in_favor"}
            onChange={() => setStance("in_favor")}
          /> Support
        </label>
        <label>
          <input
            type="radio"
            name="stance"
            value="opposed"
            checked={stance === "opposed"}
            onChange={() => setStance("opposed")}
          /> Oppose
        </label>
      </fieldset>

      <div className="section">
        <label htmlFor="count">3. Tweets: <strong>{tweetCount}</strong></label>
        <input
          id="count"
          type="range"
          min={10} max={100} step={10}
          value={tweetCount}
          onChange={(e) => setTweetCount(+e.target.value)}
        />
      </div>

      <div className="submit-section">
        <button disabled={loading}>
          {loading ? "Working…" : isAppend ? "Generate Replies" : "Promote"}
        </button>
      </div>
    </form>
  );
}
