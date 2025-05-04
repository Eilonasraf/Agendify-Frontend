import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PricingPage from "./pages/PricingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import DashboardPage from "./pages/DashboardPage";
import NewClusterPage from "./pages/NewClusterPage";
import PromotionClusterPage from "./pages/PromotionClusterPage";
import PromoteForm from "./components/PromoteForm";
import PromoteResultsPage from "./pages/PromoteResultsPage";

export default function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
      />

      <Route
        path="/profile"
        element={user ? <ProfilePage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/dashboard"
        element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/clusters/new"
        element={user ? <NewClusterPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/clusters/:agendaId"
        element={user ? <PromotionClusterPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/clusters/:agendaId/promote"
        element={user ? <PromoteForm /> : <Navigate to="/login" replace />}
      />

      <Route
        path="/clusters/:agendaId/promote/results"
        element={user ? <PromoteResultsPage /> : <Navigate to="/login" replace />}
      />

      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
