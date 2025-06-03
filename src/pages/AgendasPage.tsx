// src/pages/AgendasPage.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/agenda.css";
import ClipLoader from "react-spinners/ClipLoader";

// Twitter widget type definition (unchanged)
interface TwitterWidgets {
  widgets: {
    load: (el?: HTMLElement | null) => void;
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

export default function AgendasPage() {
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
    fetch(`${API_BASE}/agendas?userId=${user._id}`)
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

  // helper to try loading widgets
  function tryLoadWidgets() {
    const tw = window.twttr;
    if (tw?.widgets?.load) {
      tw.widgets.load();
    }
  }

  // 2) When modal opens: reset slide & spinner, inject script & load embed
  useEffect(() => {
    if (modalOpen && selectedAgenda) {
      setCurrentSlide(0);
      setEmbedLoaded(false);

      // inject Twitter widgets script once
      if (!document.getElementById("twitter-wjs")) {
        const script = document.createElement("script");
        script.id = "twitter-wjs";
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        document.body.appendChild(script);
      }

      tryLoadWidgets();

      // poll until the iframe appears
      const poll = setInterval(() => {
        const iframe = document.querySelector(
          ".modal-content .carousel-slide iframe"
        );
        if (iframe) {
          setEmbedLoaded(true);
          clearInterval(poll);
        } else {
          tryLoadWidgets();
        }
      }, 100);

      return () => clearInterval(poll);
    }
  }, [modalOpen, selectedAgenda]);

  // 3) On slide change: reset spinner & reload embed
  useEffect(() => {
    if (modalOpen) {
      setEmbedLoaded(false);
      tryLoadWidgets();
      const poll = setInterval(() => {
        const iframe = document.querySelector(
          ".modal-content .carousel-slide iframe"
        );
        if (iframe) {
          setEmbedLoaded(true);
          clearInterval(poll);
        } else {
          tryLoadWidgets();
        }
      }, 100);
      return () => clearInterval(poll);
    }
  }, [currentSlide, modalOpen]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this agenda forever?")) return;
    try {
      const resp = await fetch(`${API_BASE}/agendas/${id}`, {
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
      const resp = await fetch(`${API_BASE}/agendas/${agendaId}`);
      if (!resp.ok) throw new Error("Failed to load agenda");
      const data: AgendaDetail = await resp.json();
      setSelectedAgenda(data);
      setModalOpen(true);
    } catch (err) {
      console.error(err);
      alert("Could not load agenda.");
    }
  };

  if (loading) return <p className="loading-text">Loading your agendas…</p>;

  return (
    <div className="agendas-page-root">
      {/* ——— HERO / VIDEO BACKGROUND ——— */}
      <section className="agendas-hero">
        <div className="video-background">
          <video
            id="heroVideo"
            autoPlay
            muted
            loop
            playsInline
            poster="https://www.quantum-machines.co/wp-content/uploads/2023/04/Qunatum_Header_436-1920.png"
          >
            <source
              src="https://www.quantum-machines.co/wp-content/uploads/2025/03/video-road.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="hero-overlay" />
        <div className="inner-wrapper">
          <div className="inner-content">
            <h1 className="hero-title">📦 My Agendas</h1>
            <p className="hero-subtitle">
              Manage your agendas and promote with a single click
            </p>
          </div>
        </div>
      </section>

      {/* ——— WHITE “DASHBOARD” THAT STRETCHES TO BOTTOM ——— */}
      <section className="dashboard-section">
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
                    title="Delete Agenda"
                  >
                    🗑️
                  </button>
                  <button
                    className="stats-btn"
                    onClick={() =>
                      navigate(`/agendas/${agenda.agendaId}/dashboard`)
                    }
                    title="View Stats"
                  >
                    📊
                  </button>
                  <button
                    className="open-btn"
                    onClick={() => openAgendaModal(agenda.agendaId)}
                    title="Open Agenda"
                  >
                    ➡️
                  </button>
                </div>
              </div>
              <button
                className="card-add-btn"
                onClick={() => navigate(`/agendas/${agenda.agendaId}`)}
                aria-label="View Agenda"
              >
                +
              </button>
            </div>
          ))}

          {/* ——— “New Agenda” CARD ——— */}
          <div
            className="agenda-card new-agenda-card"
            onClick={() => navigate("/agendas/new")}
          >
            <div className="new-pill">+ New Agenda</div>
            <div className="new-body">
              <p>Click here to create your next agenda.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— OPTIONAL: PROMOTION/MODAL CAROUSEL ——— */}
      {modalOpen && selectedAgenda && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div
            className="modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setModalOpen(false)}
            >
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
                    <ClipLoader color="#6a0dad" size={60} loading={!embedLoaded} />
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
                    i === 0
                      ? selectedAgenda.tweets.length - 1
                      : i - 1
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
