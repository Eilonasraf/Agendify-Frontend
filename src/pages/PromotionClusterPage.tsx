// src/pages/PromotionClusterPage.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../styles/PromotionClusterPage.css";

type TweetItem = {
  replyTweetId:      string;
  originalTweetId:   string;
  originalTweetText: string;
  responseComment:   string;
  aiGeneratedComment?: string;
  createdAt:         string;
};

type Cluster = {
  _id:    string;
  title:  string;
  prompt: string;
  tweets: TweetItem[];
};

export default function PromotionClusterPage() {
  const { agendaId } = useParams<{ agendaId: string }>();
  const navigate     = useNavigate();
  const [cluster, setCluster]   = useState<Cluster | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    if (!agendaId) return;
    fetch(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/agendas/${agendaId}`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: Cluster) => {
        setCluster(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [agendaId]);

  if (loading) return <p>Loading cluster…</p>;
  if (error)   return <p style={{ color: "red" }}>❌ {error}</p>;
  if (!cluster) return <p>Cluster not found.</p>;

  return (
    <div className="cluster-page">
      <header className="cluster-header">
        <h1>🎯 {cluster.title}</h1>
        <p className="prompt">Prompt: {cluster.prompt}</p>
        <button
          className="btn-promote-more"
          onClick={() =>
            navigate(`/agendas/${agendaId}/promote`, {
              state: { agendaId, agendaTitle: cluster.title },
            })
          }
        >
          + Promote More
        </button>
      </header>

      {/* We removed the entire “Replies so far” section here. */}
    </div>
  );
}