import { useEffect, useState } from "react";
import { useNavigate }          from "react-router-dom";
import "../styles/Dashboard.css";

// locally extend Window so TS knows about twttr (if you ever embed tweets here)
declare global {
  interface Window {
    twttr?: {
      widgets?: {
        load?: () => void;
      };
    };
  }
}

type AgendaSummary = {
  agendaId:    string;
  title:       string;
  tweetsCount: number;
  createdAt:   string;
};

export default function DashboardPage() {
  const [clusters, setClusters] = useState<AgendaSummary[]>([]);
  const [loading,  setLoading]  = useState(true);
  const navigate = useNavigate();
  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    fetch(`${API_BASE}/clusters?userId=${user._id}`)
      .then((r) => r.json())
      .then((data: AgendaSummary[]) => {
        setClusters(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this cluster forever?")) return;
    try {
      const resp = await fetch(`${API_BASE}/clusters/${id}`, {
        method: "DELETE",
      });
      if (!resp.ok) throw new Error("Failed to delete");
      // remove locally
      setClusters((cls) => cls.filter((c) => c.agendaId !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete cluster.");
    }
  };

  if (loading) return <p>Loading your clusters…</p>;

  return (
    <div className="dashboard-container">
      <h1>My Clusters</h1>
      <div className="grid">
        {clusters.map((c) => (
          <div key={c.agendaId} className="card">
            <div className="card-header">
              <h2 onClick={() => navigate(`/clusters/${c.agendaId}`)}>
                {c.title}
              </h2>
              <button
                className="delete-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(c.agendaId);
                }}
                aria-label="Delete cluster"
              >
                ✕
              </button>
            </div>
            <p>{c.tweetsCount} replies</p>
            <small>{new Date(c.createdAt).toLocaleString()}</small>
          </div>
        ))}

        {/* + New cluster card */}
        <div
          className="card new-card"
          onClick={() => navigate("/clusters/new")}
        >
          <h2>+ New Cluster</h2>
        </div>
      </div>
    </div>
  );
}
