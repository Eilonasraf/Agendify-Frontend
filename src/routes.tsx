import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AgendasPage from "./pages/AgendasPage";
import NewClusterPage from "./pages/NewClusterPage";
import PromotionClusterPage from "./pages/PromotionClusterPage";
import PromoteForm from "./components/PromoteForm";
import PromoteResultsPage from "./pages/PromoteResultsPage";
import DashboardPage from "./pages/DashboardPage";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/agendas" replace />}
      />
      <Route
        path="/register"
        element={!user ? <RegisterPage /> : <Navigate to="/agendas" replace />}
      />

      <Route
        path="/profile"
        element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/agendas"
        element={user ? <AgendasPage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/agendas/new"
        element={user ? <NewClusterPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/agendas/:agendaId"
        element={user ? <PromotionClusterPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/agendas/:agendaId/promote"
        element={user ? <PromoteForm /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/agendas/:agendaId/promote/results"
        element={user ? <PromoteResultsPage /> : <Navigate to="/login" replace />}
      />

      <Route
      path="/agendas/:agendaId/dashboard"
      element={<DashboardPage />}
      />

      <Route
        path="*"
        element={<Navigate to={user ? "/agendas" : "/login"} replace />}
      />
    </Routes>
  );
}
