// src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "../styles/navbar.css";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Agendify</Link>

        <ul className="navbar-links">
          <li>
            <Link to="/"      className={`nav-link ${isActive("/")      ? "active" : ""}`}>Home</Link>
          </li>
          <li>
            <Link to="/about" className={`nav-link ${isActive("/about") ? "active" : ""}`}>About Us</Link>
          </li>
          <li>
            <Link to="/pricing" className={`nav-link ${isActive("/pricing") ? "active" : ""}`}>Pricing</Link>
          </li>
        </ul>

        <div className="navbar-auth">
          {user ? (
            <>
              <Link to="/dashboard" className={`btn ${isActive("/dashboard") ? "active" : ""}`}>
                Dashboard
              </Link>
              <Link to="/profile" className={`btn ${isActive("/profile") ? "active" : ""}`}>
                Profile
              </Link>
              <Link to="/home" onClick={handleLogout} className={`btn ${isActive("/profile") ? "active" : ""}`}>
                Logout
              </Link>
            </>
          ) : (
            <>
              <Link to="/login"    className={`btn ${isActive("/login")    ? "active" : ""}`}>Sign in</Link>
              <Link to="/register" className={`btn ${isActive("/register") ? "active" : ""}`}>Sign up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
