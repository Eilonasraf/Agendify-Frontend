import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/dashboard.css";
import ClipLoader from "react-spinners/ClipLoader";

// Twitter widget type definition
interface TwitterWidgets {
  widgets: {
    load: () => void;
  };
}

declare global {
  interface Window {
    twttr?: TwitterWidgets;
  }
}

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
  const [selectedAgenda, setSelectedAgenda] = useState<AgendaDetail | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [embedLoaded, setEmbedLoaded] = useState(false);
  const navigate = useNavigate();

  const API_BASE =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

  // 1) Load agendas on mount
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

  // 2) When modal opens: reset slide & spinner, inject script & load embed
  useEffect(() => {
    if (modalOpen && selectedAgenda) {
      setCurrentSlide(0);
      setEmbedLoaded(false);

      // inject Twitter widgets script if needed
      if (!window.twttr) {
        const script = document.createElement("script");
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        document.body.appendChild(script);
      }

      // trigger embed rendering
      window.twttr?.widgets?.load();
      // poll until the iframe actually appears
      const poll = setInterval(() => {
        const iframe = document.querySelector(
          ".modal-content .carousel-slide iframe"
        );
        if (iframe) {
          setEmbedLoaded(true);
          clearInterval(poll);
        }
      }, 100);

      return () => clearInterval(poll);
    }
  }, [modalOpen, selectedAgenda]);

  // 3) On slide change: reset spinner & reload embed
  useEffect(() => {
    if (modalOpen) {
      setEmbedLoaded(false);
      window.twttr?.widgets?.load();
      const poll = setInterval(() => {
        const iframe = document.querySelector(
          ".modal-content .carousel-slide iframe"
        );
        if (iframe) {
          setEmbedLoaded(true);
          clearInterval(poll);
        }
      }, 100);
      return () => clearInterval(poll);
    }
  }, [currentSlide, modalOpen]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this agenda forever?")) return;
    try {
      const resp = await fetch(`${API_BASE}/clusters/${id}`, {
        method: "DELETE",
      });
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
          You haven’t created any agendas yet. Click the button below to get
          started.
        </p>
      )}

      <div className="agenda-grid">
        {agendas.map((agenda) => (
          <div className="agenda-card" key={agenda.agendaId}>
            <div className="agenda-pill">{agenda.title}</div>
            <div className="agenda-body">
              <p className="agenda-date">
                🕒 Start: {new Date(agenda.createdAt).toLocaleDateString()}
              </p>
              <div className="card-actions">
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(agenda.agendaId)}
                >
                  🗑️
                </button>
                <button
                  className="stats-btn"
                  onClick={() => navigate(`/clusters/${agenda.agendaId}/stats`)}
                >
                  📊
                </button>
                <button
                  className="open-btn"
                  onClick={() => openAgendaModal(agenda.agendaId)}
                >
                  ➡️
                </button>
              </div>
            </div>
            <button
              className="card-add-btn"
              onClick={() => navigate(`/clusters/${agenda.agendaId}`)}
              aria-label="View Agenda"
            >
              +
            </button>
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
            <button className="modal-close" onClick={() => setModalOpen(false)}>
              ✖
            </button>
            <div className="modal-body">
              <h2>{selectedAgenda.title}</h2>
              <p className="prompt-text">{selectedAgenda.prompt}</p>
              <div className="carousel-count">
                Slide {currentSlide + 1} of {selectedAgenda.tweets.length}
              </div>
            </div>
            <div className="carousel-container">
              <div
                key={selectedAgenda.tweets[currentSlide].replyTweetId}
                className="carousel-slide"
              >
                {!embedLoaded && (
                  <div className="spinner-wrapper">
                    <ClipLoader
                      color="#6a0dad"
                      size={60}
                      loading={!embedLoaded}
                    />
                  </div>
                )}
                <blockquote className="twitter-tweet">
                  <a
                    href={`https://twitter.com/ffff/status/${selectedAgenda.tweets[currentSlide].replyTweetId}`}
                  ></a>
                </blockquote>
              </div>

              <button
                className="carousel-nav carousel-nav--prev"
                onClick={() =>
                  setCurrentSlide((i) =>
                    i === 0 ? selectedAgenda.tweets.length - 1 : i - 1
                  )
                }
                aria-label="Previous tweet"
              >
                ‹
              </button>
              <button
                className="carousel-nav carousel-nav--next"
                onClick={() =>
                  setCurrentSlide((i) =>
                    i === selectedAgenda.tweets.length - 1 ? 0 : i + 1
                  )
                }
                aria-label="Next tweet"
              >
                ›
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
