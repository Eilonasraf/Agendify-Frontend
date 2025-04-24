import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Public Pages
import HomePage     from "./pages/HomePage";
import AboutPage    from "./pages/AboutPage";
import PricingPage  from "./pages/PricingPage";
import LoginPage    from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

// Protected Pages
import DashboardPage from "./pages/DashboardPage";
import PromotePage   from "./pages/PromotePage";
import PromoteResultsPage from "./pages/PromoteResultsPage";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<HomePage />} />
      <Route path="/about"   element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />

      {/* Auth */}
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route
        path="/register"
        element={!user ? <RegisterPage /> : <Navigate to="/dashboard" replace />}
      />

      {/* Protected */}
      <Route
        path="/dashboard"
        element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/promote"
        element={user ? <PromotePage /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/promote/results"
        element={user ? <PromoteResultsPage /> : <Navigate to="/login" replace />}
      />

      {/* Catch‑all */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRoutes;
