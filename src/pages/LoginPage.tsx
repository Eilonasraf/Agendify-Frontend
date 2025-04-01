import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import apiClient from "../services/api-client";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import "../styles/login.css";

const LoginPage = () => {
  const authContext = useContext(AuthContext);
  if (!authContext) {
    throw new Error("AuthContext is null");
  }

  const { login, setUser } = authContext;
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please enter your username and password.");
      return;
    }

    try {
      await login(username, password);
      navigate("/dashboard");
    } catch {
      setError("Invalid username or password. Please try again.");
    }
  };

  const googleSignin = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) throw new Error("Google credential is missing");

    const response = await apiClient.post("/auth/google", { credential });
    return response.data;
  };

  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const res = await googleSignin(credentialResponse);
      localStorage.setItem("user", JSON.stringify(res));
      setUser(res);
      navigate("/dashboard");
    } catch (err) {
      console.error("Google Signin error!", err);
    }
  };

  const onGoogleLoginError = () => {
    console.error("🛑 Google login failed!");
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Welcome Back!</h2>

        {error && <div className="alert alert-danger text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-control"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-control"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        <p className="mt-3">Don’t have an account? <Link to="/register">Register here</Link></p>

        <div className="google-login mt-3">
          <GoogleLogin
            onSuccess={onGoogleLoginSuccess}
            onError={onGoogleLoginError}
            theme="outline"
            size="large"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;