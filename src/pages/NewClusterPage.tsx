// src/pages/NewClusterPage.tsx
import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/NewClusterPage.css";

const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

export default function NewClusterPage() {
  const [topic, setTopic] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setError("❌ Please enter a cluster title (2–3 words).");
      return;
    }

    const stored = localStorage.getItem("user");
    const userId = stored ? JSON.parse(stored)._id : null;
    if (!userId) {
      setError("❌ You must be logged in to create a cluster.");
      return;
    }

    try {
      const resp = await fetch(
        `${API_BASE}/clusters`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, topic: topic.trim() }),
        }
      );
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || resp.statusText);
      navigate(`/clusters/${data.clusterId}`);
    } catch (err: any) {
      setError(`❌ ${err.message}`);
    }
  };

  return (
    <div className="new-cluster-page">
      <form onSubmit={handleSubmit} className="new-cluster-form">
        <h1>+ New Cluster</h1>
        {error && <div className="error">{error}</div>}
        <label>
          Cluster title (2–3 words max):
          <input
            type="text"
            placeholder="e.g. Gaza Aid Debate"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />
        </label>
        <button type="submit">Create Cluster</button>
      </form>
    </div>
  );
}
