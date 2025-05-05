import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";

type AgendaSummary = {
  agendaId: string;
  title: string;
  tweetsCount: number;
  createdAt: string;
};

type TweetItem = {
  replyTweetId: string;
  originalTweetId: string;
  originalTweetText: string;
  responseComment: string;
  createdAt: string;
};

type AgendaDetail = {
  _id: string;
  title: string;
  prompt: string;
  tweets: TweetItem[];
};

export default function DashboardPage() {
  const [agendas, setAgendas] = useState<AgendaSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaDetail | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();

  const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    fetch(`${API_BASE}/clusters?userId=${user._id}`)
      .then((r) => r.json())
      .then((data) => {
        setAgendas(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this agenda forever?")) return;
    try {
      const resp = await fetch(`${API_BASE}/clusters/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Failed to delete");
      setAgendas((prev) => prev.filter((a) => a.agendaId !== id));
    } catch (err) {
      console.error(err);
      alert("Could not delete agenda.");
    }
  };

  const openAgendaModal = async (agendaId: string) => {
    try {
      const resp = await fetch(`${API_BASE}/clusters/${agendaId}`);
      if (!resp.ok) throw new Error("Failed to load agenda");
      const data: AgendaDetail = await resp.json();
      setSelectedAgenda(data);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Could not load agenda.");
    }
  };

  if (loading) return <p>Loading your agendas…</p>;

  return (
    <div className="dashboard-container white-bg">
      <h1 className="main-title">🗂️ My Agendas</h1>

      {agendas.length === 0 && (
        <p className="empty-message">
          You haven’t created any agendas yet. Click the button below to get started.
        </p>
      )}

      <div className="agenda-grid">
        {agendas.map((agenda) => (
          <div className="agenda-card" key={agenda.agendaId}>
            <div className="agenda-pill">{agenda.title}</div>
            <div className="agenda-body">
              <p className="agenda-date">🕒 Start: {new Date(agenda.createdAt).toLocaleDateString()}</p>
              <div className="card-actions">
                <button className="delete-btn" onClick={() => handleDelete(agenda.agendaId)}>🗑️</button>
                <button className="stats-btn" onClick={() => navigate(`/clusters/${agenda.agendaId}/stats`)}>📊</button>
                <button className="open-btn" onClick={() => openAgendaModal(agenda.agendaId)}>➡️</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="new-agenda-button-container">
        <button
          className="new-agenda-btn"
          onClick={() => navigate("/clusters/new")}
          >
          + New Agenda
        </button>
      </div>

      {modalOpen && selectedAgenda && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModalOpen(false)}>✖</button>
            <h2>{selectedAgenda.title}</h2>
            <p className="prompt-text">{selectedAgenda.prompt}</p>
            <div className="modal-table-container">
              <table className="modal-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Original Tweet</th>
                    <th>Reply</th>
                    <th>Date</th>
                    <th>Link</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedAgenda.tweets.map((t, i) => (
                    <tr key={t.replyTweetId}>
                      <td>{i + 1}</td>
                      <td>{t.originalTweetText}</td>
                      <td>{t.responseComment}</td>
                      <td>{new Date(t.createdAt).toLocaleString()}</td>
                      <td>
                        <a
                          href={`https://twitter.com/i/web/status/${t.replyTweetId}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          🌐
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}