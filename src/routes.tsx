import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Public Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import AboutPage from "./pages/AboutPage";
import PricingPage from "./pages/PricingPage";

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/feed" />} />
      <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/feed" />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to={user ? "/feed" : "/login"} />} />
    </Routes>
  );
};

export default AppRoutes;