import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import "../styles/stats.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

type TweetItem = {
  replyTweetId: string;
  originalTweetId: string;
  originalTweetText: string;
  responseComment: string | null;
  createdAt: string;
  score?: number;
};

type AgendaDetail = {
  _id: string;
  title: string;
  prompt: string;
  tweets: TweetItem[];
};

export default function StatsPage() {
  const { agendaId } = useParams<{ agendaId: string }>();
  const [agenda, setAgenda] = useState<AgendaDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!agendaId) return;
    fetch(`${import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api"}/clusters/${agendaId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data: AgendaDetail) => {
        setAgenda(data);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [agendaId]);

  if (loading) return <p>Loading stats…</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;
  if (!agenda) return <p>Agenda not found.</p>;

  const tweets = agenda.tweets;
  const withReply = tweets.filter(t => t.score !== 0 && t.responseComment);
  const skipped = tweets.filter(t => t.score === 0);

  const groupedByDay: { [day: string]: number } = {};
  tweets.forEach(t => {
    const day = new Date(t.createdAt).toLocaleDateString();
    groupedByDay[day] = (groupedByDay[day] || 0) + 1;
  });

  const barData = {
    labels: Object.keys(groupedByDay),
    datasets: [
      {
        label: "Tweets Processed",
        data: Object.values(groupedByDay),
        backgroundColor: "#a05cff",
      },
    ],
  };

  const pieData = {
    labels: ["Replies", "Skipped"],
    datasets: [
      {
        data: [withReply.length, skipped.length],
        backgroundColor: ["#4caf50", "#f44336"],
      },
    ],
  };

  return (
    <div className="stats-container">
      <h1>📈 Stats for: {agenda.title}</h1>
      <p className="prompt"><strong>Prompt:</strong> {agenda.prompt}</p>
  
      <ul>
        <li><strong>Total Tweets:</strong> {tweets.length}</li>
        <li><strong>Replies:</strong> {withReply.length}</li>
        <li><strong>Skipped:</strong> {skipped.length}</li>
      </ul>
  
      <div className="chart-grid">
        <div className="chart-card">
          <h3>Tweets Processed Per Day</h3>
          <Bar data={barData} />
        </div>
  
        <div className="chart-card">
          <h3>Replies vs. Skipped</h3>
          <Pie data={pieData} />
        </div>
      </div>
    </div>
  );  
}  