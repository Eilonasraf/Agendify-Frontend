import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/PromoteForm.css";

// Hardcoded debate topics
const TOPICS = [
  "Israeli-Palestinian Conflict",
  "Abortion Access",
  "AI Regulation",
  "Climate Change",
  "European Immigration",
] as const;

// Subtopics as one‑sided propositions
const SUBTOPICS: Record<string, string[]> = {
  "Israeli-Palestinian Conflict": [
    "Two-state solution",
    "Israel sovereignty",
    "Trump transfer plan",
    "Israel self-defense",
  ],
  "Abortion Access": [
    "State abortion bans should be enacted",
    "Abortion is morally permissible",
    "Parental consent should be required for minors",
    "Expand abortion clinic access in rural areas",
  ],
  "AI Regulation": [
    "Strict AI regulations should be enacted",
    "Unregulated AI fosters innovation",
    "AI surveillance poses privacy risks",
    "Industry self‑regulation ensures AI safety",
  ],
  "Climate Change": [
    "Carbon tax is necessary to reduce emissions",
    "Renewable energy investment boosts economy",
    "Climate policies stifle business growth",
    "International agreements enforce emission targets",
  ],
  "European Immigration": [
    "Open border policies strengthen economies",
    "Strict border controls protect national security",
    "Asylum procedures require simplification",
    "Immigration enhances cultural diversity",
  ],
};

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function PromoteForm() {
  const [topic, setTopic] = useState<string>("");
  const [subtopic, setSubtopic] = useState<string>("");
  const [stance, setStance] = useState<"in_favor" | "opposed" | "">("");
  const [tweetCount, setTweetCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // grab user ID from localStorage
  let currentUserId = "";
  try {
    const stored = localStorage.getItem("user");
    if (stored) {
      const u = JSON.parse(stored);
      currentUserId = u._id || "";
    }
    console.log("currentUserId", currentUserId);
  } catch {
    // Silently handle localStorage or JSON parsing errors
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic || !subtopic || !stance) {
      setMessage("❌ Please select topic, subtopic & stance.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const resp = await fetch(
        `${API_BASE}/twitter/promote?count=${tweetCount}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic,
            subtopics: [subtopic],
            stance,
            createdBy: currentUserId,
          }),
        }
      );

      const data = await resp.json().catch(() => null);
      if (!resp.ok) {
        throw new Error(data?.error || resp.statusText);
      }

      navigate("/promote/results", { state: { tweets: data.tweets } });
    } catch (err) {
      setMessage(`❌ ${err instanceof Error ? err.message : "An unknown error occurred"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="promote-form">
      <fieldset className="section">
        <legend>1. Topic</legend>
        <div className="choices choices--vertical">
          {TOPICS.map((t) => (
            <label key={t} className="choice">
              <input
                type="radio"
                name="topic"
                value={t}
                checked={topic === t}
                onChange={() => {
                  setTopic(t);
                  setSubtopic("");
                }}
              />
              {t}
            </label>
          ))}
        </div>
      </fieldset>

      {topic && (
        <fieldset className="section">
          <legend>2. Subtopic</legend>
          <div className="choices choices--vertical">
            {SUBTOPICS[topic].map((st) => (
              <label key={st} className="choice">
                <input
                  type="radio"
                  name="subtopic"
                  value={st}
                  checked={subtopic === st}
                  onChange={() => setSubtopic(st)}
                />
                {st}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="section">
        <legend>3. Stance</legend>
        <div className="choices choices--vertical">
          <label className="choice">
            <input
              type="radio"
              name="stance"
              value="in_favor"
              checked={stance === "in_favor"}
              onChange={() => setStance("in_favor")}
            />
            Support
          </label>
          <label className="choice">
            <input
              type="radio"
              name="stance"
              value="opposed"
              checked={stance === "opposed"}
              onChange={() => setStance("opposed")}
            />
            Oppose
          </label>
        </div>
      </fieldset>

      <div className="section">
        <label htmlFor="count">
          4. Tweets: <span className="count-label">{tweetCount}</span>
        </label>
        <input
          id="count"
          type="range"
          min={10}
          max={100}
          step={10}
          value={tweetCount}
          onChange={(e) => setTweetCount(+e.target.value)}
        />
      </div>

      <div className="submit-section">
        <button type="submit" disabled={loading}>
          {loading ? "Working…" : "Apply"}
        </button>
      </div>

      {message && <div className="message">{message}</div>}
    </form>
  );
}