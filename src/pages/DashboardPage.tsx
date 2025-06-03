// src/pages/DashboardPage.tsx

import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Bar, Line } from "react-chartjs-2";
import "../styles/stats.css";

// ─── Register Chart.js components + datalabels plugin ─────────────────────────
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
  Legend,
  ChartDataLabels
);

// ─── Types ─────────────────────────────────────────────────────────────────────
type EngagementMetrics = {
  like_count: number;
  reply_count: number;   // replies *to* your reply
  views_count: number;
  retweet_count: number; // number of retweets
};

type TweetItem = {
  replyTweetId:      string;
  originalTweetId:   string;
  originalTweetText: string;
  responseComment:   string | null;
  createdAt:         string;
  engagement?:       EngagementMetrics & { fetchedAt?: string };
};

type AgendaDetail = {
  _id:       string;
  title:     string;
  prompt:    string;
  createdAt: string;
  tweets:    TweetItem[];
};

export default function DashboardPage() {
  const { agendaId } = useParams<{ agendaId: string }>();
  const [agenda, setAgenda]       = useState<AgendaDetail | null>(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "replies">("overview");
  const [filter, setFilter]       = useState<"all" | "replies" | "views">("all");
  const [currentSlide, setCurrentSlide] = useState(0);

  // ─── Fetch agenda data ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!agendaId) return;
    fetch(
      `${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/agendas/${agendaId}`
    )
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: AgendaDetail) => setAgenda(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [agendaId]);

  // ─── Inject Twitter widgets (for “Replies History” tab) ───────────────────────
  function tryLoadWidgets() {
    const tw = window.twttr;
    if (tw?.widgets?.load) {
      const container = document.querySelector(".replies-carousel");
      tw.widgets.load(container as HTMLElement | null);
    }
  }

  useEffect(() => {
    if (activeTab === "replies" && agenda) {
      setCurrentSlide(0);
      if (!document.getElementById("twitter-wjs")) {
        const script = document.createElement("script");
        script.id = "twitter-wjs";
        script.src = "https://platform.twitter.com/widgets.js";
        script.async = true;
        script.charset = "utf-8";
        document.body.appendChild(script);
      }
      const initPoll = setTimeout(() => {
        tryLoadWidgets();
        const interval = setInterval(() => {
          const iframe = document.querySelector(".replies-carousel iframe");
          if (iframe) {
            clearInterval(interval);
          } else {
            tryLoadWidgets();
          }
        }, 200);
        return () => clearInterval(interval);
      }, 50);

      return () => clearTimeout(initPoll);
    }
  }, [activeTab, agenda]);

  useEffect(() => {
    if (activeTab === "replies") {
      const slidePoller = setTimeout(() => {
        tryLoadWidgets();
        const interval = setInterval(() => {
          const iframe = document.querySelector(".replies-carousel iframe");
          if (iframe) {
            clearInterval(interval);
          } else {
            tryLoadWidgets();
          }
        }, 200);
        return () => clearInterval(interval);
      }, 50);

      return () => clearTimeout(slidePoller);
    }
  }, [currentSlide, activeTab]);

  if (loading) return <p>Loading dashboard…</p>;
  if (error)   return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!agenda) return <p>Agenda not found.</p>;

  const { title, prompt, createdAt, tweets } = agenda;

  // ─── Compute KPI Metrics ──────────────────────────────────────────────────────
  const totalReplies = tweets.filter((t) => !!t.replyTweetId).length;

  let engagedTweetsCount = 0;
  let untouchedCount      = 0;
  let totalLikes          = 0;
  let totalViews          = 0;
  let totalRetweets       = 0;

  tweets.forEach((t) => {
    const em = t.engagement;
    if (!t.replyTweetId) {
      untouchedCount++;
      return;
    }
    const likes     = em?.like_count     || 0;
    const replies   = em?.reply_count    || 0;
    const views     = em?.views_count    || 0;
    const retweets  = em?.retweet_count  || 0;

    totalLikes    += likes;
    totalViews    += views;
    totalRetweets += retweets;

    if (likes > 0 || replies > 0 || views > 0 || retweets > 0) {
      engagedTweetsCount++;
    } else {
      untouchedCount++;
    }
  });

  const engagementRatePercent = tweets.length
    ? Math.round((engagedTweetsCount / tweets.length) * 100)
    : 0;

  // ─── “Replies You Posted” Over Time (vertical bar) ─────────────────────────
  const repliedTweets = tweets.filter((t) => !!t.replyTweetId);
  const repliesByDay: { [day: string]: number } = {};
  repliedTweets.forEach((t) => {
    const day = new Date(t.createdAt).toLocaleDateString();
    repliesByDay[day] = (repliesByDay[day] || 0) + 1;
  });
  const barData = {
    labels: Object.keys(repliesByDay),
    datasets: [
      {
        label: "Replies per Day",
        data: Object.values(repliesByDay),
        backgroundColor: "#b19cd9",
        borderRadius: 6,
        maxBarThickness: 40,
      },
    ],
  };
  const barOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title:  { display: false },
    },
    scales: {
      x: {
        grid: { color: "#ece9f6" },
        ticks: {
          color: "#7b809a",
          font: { size: 13, weight: "bold" as const },
        },
      },
      y: {
        grid: { color: "#ece9f6" },
        ticks: {
          color: "#7b809a",
          font: { size: 13, weight: "bold" as const },
          stepSize: 1,
          beginAtZero: true,
        },
      },
    },
  } as const;

  // ─── Engagement Timeline (line chart) ────────────────────────────────────────
  const engagementByDay: {
    [date: string]: { replies: number; likes: number; views: number };
  } = {};
  let earliestReply: Date | null = null;

  tweets.forEach((t) => {
    if (!t.replyTweetId) return;
    const replyDate = new Date(t.createdAt);
    if (!earliestReply || replyDate < earliestReply) {
      earliestReply = replyDate;
    }
    const day = replyDate.toLocaleDateString();
    if (!engagementByDay[day]) {
      engagementByDay[day] = { replies: 0, likes: 0, views: 0 };
    }
    engagementByDay[day].replies += t.engagement?.reply_count || 0;
    engagementByDay[day].likes   += t.engagement?.like_count  || 0;
    engagementByDay[day].views   += t.engagement?.views_count || 0;
  });

  const today = new Date();
  const dates: string[] = [];
  if (earliestReply) {
    const cur = new Date(earliestReply);
    while (cur <= today) {
      dates.push(cur.toLocaleDateString());
      cur.setDate(cur.getDate() + 1);
    }
  }
  const repliesArray = dates.map((d) => engagementByDay[d]?.replies || 0);
  const likesArray   = dates.map((d) => engagementByDay[d]?.likes   || 0);
  const viewsArray   = dates.map((d) => engagementByDay[d]?.views   || 0);

  const engagementTimelineData = {
    labels: dates,
    datasets: [
      {
        label: "Replies to Your Replies",
        data: repliesArray,
        borderColor: "#4a90e2",
        backgroundColor: "rgba(74,144,226,0.08)",
        tension: 0.3,
        fill: false,
        pointRadius: 3,
      },
      {
        label: "Likes",
        data: likesArray,
        borderColor: "#f7b731",
        backgroundColor: "rgba(247,183,49,0.08)",
        tension: 0.3,
        fill: false,
        pointRadius: 3,
      },
      {
        label: "Views",
        data: viewsArray,
        borderColor: "#F1C40F",
        backgroundColor: "rgba(241,196,15,0.08)",
        tension: 0.3,
        fill: false,
        pointRadius: 3,
      },
    ],
  };
  const engagementTimelineOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: "top" },
    },
    scales: {
      x: {
        title: { display: true, text: "Date" },
        grid: { color: "#ece9f6" },
        ticks: { color: "#7b809a", font: { size: 13, weight: "bold" as const } },
      },
      y: {
        title: { display: true, text: "Count" },
        beginAtZero: true,
        grid: { color: "#ece9f6" },
        ticks: { color: "#7b809a", font: { size: 13, weight: "bold" as const } },
      },
    },
  } as const;

  // ─── “Top 5 Replies by Replies” & “Top 5 Replies by Views” ─────────────────
  const allReplies = tweets.filter((t) => !!t.replyTweetId);
  const sortedByReplies = allReplies
    .slice()
    .sort((a, b) =>
      (b.engagement?.reply_count || 0) - (a.engagement?.reply_count || 0)
    )
    .slice(0, 5);
  const sortedByViews = allReplies
    .slice()
    .sort((a, b) =>
      (b.engagement?.views_count || 0) - (a.engagement?.views_count || 0)
    )
    .slice(0, 5);

  let displayedTweets: TweetItem[];
  if (filter === "replies") {
    displayedTweets = sortedByReplies;
  } else if (filter === "views") {
    displayedTweets = sortedByViews;
  } else {
    displayedTweets = tweets; // “all”
  }

  // ─── Build exactly those five counts in the requested order ───────────────────
  // 1. Total Replies                      = totalReplies
  // 2. Viewed Replies  (reply with views) = # of replies where views_count > 0
  // 3. Replies on My Reply                = # of replies where reply_count > 0
  // 4. Liked                              = # of replies where like_count > 0
  // 5. Retweeted                          = # of replies where retweet_count > 0
  const countViewedReplies = repliedTweets.filter(
    (t) => (t.engagement?.views_count || 0) > 0
  ).length;
  const countRepliesOnMyReply = repliedTweets.filter(
    (t) => (t.engagement?.reply_count || 0) > 0
  ).length;
  const countLikedReplies = repliedTweets.filter(
    (t) => (t.engagement?.like_count || 0) > 0
  ).length;
  const countRetweetedReplies = repliedTweets.filter(
    (t) => (t.engagement?.retweet_count || 0) > 0
  ).length;

  // ─── Horizontal Bar (five separate bars, in that exact order) ───────────────
  const histogramData = {
    labels: [
      "Total Replies",
      "Viewed Replies",
      "Replies on My Reply",
      "Liked",
      "Retweeted",
    ],
    datasets: [
      {
        label: "Count",
        data: [
          totalReplies,
          countViewedReplies,
          countRepliesOnMyReply,
          countLikedReplies,
          countRetweetedReplies,
        ],
        backgroundColor: [
          "#b19cd9", // lavender, for Total Replies
          "#b3d8fd", // light blue, for Viewed Replies
          "#27ae60", // green, for Replies on My Reply
          "#e74c3c", // red, for Liked
          "#F1C40F", // yellow, for Retweeted
        ],
        borderRadius: 6,
        barThickness: 30,
      },
    ],
  };

  const histogramOptions = {
    indexAxis: "y" as const,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: false,
        grid: { display: false },
        display: false,
      },
      y: {
        stacked: false,
        grid: { display: false },
        ticks: {
          color: "#34495e",
          font: { size: 14 },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      datalabels: {
        anchor: "end" as const,
        align: "end" as const,
        color: "#2c3e50",
        font: { weight: "bold" as const },
        formatter: (value: number) => value,
        offset: 6,
      },
      tooltip: {
        callbacks: {
          label: (context: { dataset: { label: string }; raw: number }) => {
            const label = context.dataset.label;
            const value = context.raw as number;
            const totalFive =
              totalReplies +
              countViewedReplies +
              countRepliesOnMyReply +
              countLikedReplies +
              countRetweetedReplies;
            const pct = ((value / totalFive) * 100).toFixed(1);
            return `${label}: ${value} (${pct}%)`;
          },
        },
      },
    },
  } as const;

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        {/* ——— Top Bar ——— */}
        <header className="dashboard-header">
          <div>
            <h1>Analytics Dashboard</h1>
            <p className="dashboard-subtitle">
              Agenda: <strong>{title}</strong> (Prompt: “{prompt}”)
            </p>
          </div>
        </header>

        {/* ——— Tab Buttons ——— */}
        <div className="dashboard-tabs">
          <button
            className={activeTab === "overview" ? "tab active" : "tab"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            className={activeTab === "replies" ? "tab active" : "tab"}
            onClick={() => setActiveTab("replies")}
          >
            Replies History
          </button>
        </div>

        {/* ====== Overview Tab ====== */}
        {activeTab === "overview" && (
          <>
            {/* —— KPI Cards —— */}
            <section className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon kpi-red">📅</div>
                <div className="kpi-info">
                  <div className="kpi-label">Start Date</div>
                  <div className="kpi-value">
                    {new Date(createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon kpi-yellow">💬</div>
                <div className="kpi-info">
                  <div className="kpi-label">Total Replies</div>
                  <div className="kpi-value">{totalReplies}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon kpi-green">👀</div>
                <div className="kpi-info">
                  <div className="kpi-label">Total Views</div>
                  <div className="kpi-value">{totalViews.toLocaleString()}</div>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon kpi-blue">📈</div>
                <div className="kpi-info">
                  <div className="kpi-label">Engagement Rate</div>
                  <div className="kpi-value">{engagementRatePercent}%</div>
                </div>
              </div>
            </section>

            {/* —— Charts: Histograma & Replies Over Time —— */}
            <section className="chart-grid">
              {/* ── Histograma (five horizontal bars) ─────────────────────────────────── */}
              <div className="chart-card">
                <h3>Reply Engagement Breakdown</h3>
                <div style={{ height: "240px" }}>
                  <Bar
                    key="histograma-chart"
                    data={histogramData}
                    options={histogramOptions}
                  />
                </div>
              </div>

              {/* ── Replies Over Time (vertical bar) ──────────────────────────────────── */}
              <div className="chart-card">
                <h3>Replies Over Time</h3>
                <div
                  className="bar-wrapper"
                  style={{ width: "100%", height: "340px" }}
                >
                  <Bar
                    key="replies-over-time"
                    data={barData}
                    options={barOptions}
                  />
                </div>
              </div>
            </section>

            {/* —— Engagement Timeline (line) —— */}
            <section className="top-section">
              <div className="top-card engagement-timeline-card">
                <h3>Engagement Timeline</h3>
                <div
                  className="timeline-chart-container"
                  style={{ width: "100%", height: "340px" }}
                >
                  <Line
                    key="engagement-line"
                    data={engagementTimelineData}
                    options={engagementTimelineOptions}
                  />
                </div>
              </div>
            </section>
          </>
        )}

        {/* ====== Replies History Tab ====== */}
        {activeTab === "replies" && (
          <>
            {/* —— Three Filter Buttons —— */}
            <div style={{ margin: "1rem 0" }}>
              <button
                className={filter === "all" ? "tab active" : "tab"}
                onClick={() => setFilter("all")}
              >
                Show All
              </button>
              <button
                className={filter === "replies" ? "tab active" : "tab"}
                onClick={() => setFilter("replies")}
                style={{ marginLeft: "0.5rem" }}
              >
                Top 5 by Replies
              </button>
              <button
                className={filter === "views" ? "tab active" : "tab"}
                onClick={() => setFilter("views")}
                style={{ marginLeft: "0.5rem" }}
              >
                Top 5 by Views
              </button>
            </div>

            {/* —— Replies History Table —— */}
            <section className="top-section">
              <div className="top-card replies-history-card">
                <h3>Replies History</h3>
                <table className="top-replies-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Your Reply</th>
                      <th>Posted At</th>
                      <th>Likes</th>
                      <th>Replies</th>
                      <th>Views</th>
                      <th>Retweets</th>
                      <th>View on X</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedTweets.map((t, i) => (
                      <tr key={t.replyTweetId}>
                        <td>{i + 1}</td>
                        <td>{t.responseComment}</td>
                        <td>{new Date(t.createdAt).toLocaleString()}</td>
                        <td>{t.engagement?.like_count ?? 0}</td>
                        <td>{t.engagement?.reply_count ?? 0}</td>
                        <td>{t.engagement?.views_count ?? 0}</td>
                        <td>{t.engagement?.retweet_count ?? 0}</td>
                        <td>
                          <a
                            href={`https://twitter.com/i/web/status/${t.replyTweetId}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            View on X
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
