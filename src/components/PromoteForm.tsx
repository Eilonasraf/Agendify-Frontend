// src/components/PromoteForm.tsx
import React, { useState, FormEvent } from "react";

const TOPICS = [
  "Food",
  "Politics",
  "Sport",
  "Health",
  "Technology",
  "Other",
] as const;

const SUBTOPICS: Record<string, string[]> = {
  Politics: ["Vegetarianism", "Attitude towards Country", "Autonomous vehicles", "Other"],
  Food: ["Vegan", "Organic", "Fast food", "Other"],
  Sport: ["Football", "Basketball", "Running", "Other"],
  Health: ["Mental health", "Nutrition", "Exercise", "Other"],
  Technology: ["AI", "Web dev", "Cybersecurity", "Other"],
  Other: ["Other"],
};

// pick up your VITE env var (fallback to empty so TS is happy)
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

export default function PromoteForm() {
  const [topic, setTopic] = useState<string>("");
  const [subtopics, setSubtopics] = useState<string[]>([]);
  const [freeText, setFreeText] = useState("");
  const [tweetCount, setTweetCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleTopicChange = (t: string) => {
    setTopic(t);
    setSubtopics([]);
  };

  const toggleSubtopic = (s: string) =>
    setSubtopics((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        
        // ensure this is exactly where your Express router is mounted:
        const url = `${API_BASE}/twitter/promote?count=${tweetCount}`
        console.log('Calling promote at', url)

        try {
            const resp = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ topic, subtopics, freeText }),
            })
            const data = await resp.json().catch(() => null)
        
            if (!resp.ok) {
            setMessage(`❌ ${data?.error || resp.statusText}`)
            } else {
            setMessage(`✅ ${data.message}`)
            }
        } finally {
            setLoading(false)
        }
    }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Topic */}
      <div>
        <label className="block font-medium mb-2">Topic</label>
        <div className="flex flex-wrap gap-4">
          {TOPICS.map((t) => (
            <label key={t} className="inline-flex items-center">
              <input
                type="radio"
                name="topic"
                value={t}
                checked={topic === t}
                onChange={() => handleTopicChange(t)}
                className="mr-2"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      {/* Subtopics */}
      {topic && (
        <div>
          <label className="block font-medium mb-2">Sub Topic</label>
          <div className="flex flex-wrap gap-4">
            {SUBTOPICS[topic].map((st) => (
              <label key={st} className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={st}
                  checked={subtopics.includes(st)}
                  onChange={() => toggleSubtopic(st)}
                  className="mr-2"
                />
                {st}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Free text */}
      <div>
        <label className="block font-medium mb-2">
          Free text (max 20 words)
        </label>
        <textarea
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          maxLength={200}
          rows={3}
          className="w-full border rounded p-2"
          placeholder="Briefly add what you want to talk about…"
        />
        <p className="text-sm text-gray-500 mt-1">
          {freeText.split(/\s+/).filter(Boolean).length}/20 words
        </p>
      </div>

      {/* Tweet count */}
      <div>
        <label className="block font-medium mb-2">
          How many Tweets?
        </label>
        <input
          type="range"
          min={10}
          max={100}
          step={10}
          value={tweetCount}
          onChange={(e) => setTweetCount(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-sm text-gray-600 mt-1">
          {tweetCount} tweets
        </p>
      </div>

      {/* Submit */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? "Working…" : "Apply"}
        </button>
      </div>

      {/* Result message */}
      {message && <p className="mt-4 text-center text-black">{message}</p>}
    </form>
  );
}
