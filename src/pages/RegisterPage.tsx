import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { useAuth } from "../context/AuthContext";
import apiClient from "../services/api-client";
import axios from "axios";
import defaultAvatar from "../assets/default-avatar.png";
import maleAvatar from "../assets/male-avatar.png";
import femaleAvatar from "../assets/female-avatar.png";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import "../styles/register.css";

const registerSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long" })
    .regex(/^(?=.*[a-zA-Z])(?=.*\d).+$/, {
      message: "Username must contain both letters and numbers",
    }),
  email: z.string().email({ message: "Invalid email format" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters long" }),
});

// ✅ Format the profile picture URL to avoid "undefined/uploads/..." issue
const formatProfilePictureUrl = (url: string): string => {
  const backend = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, "") || "http://localhost:4040";
  if (!url) return "/default-avatar.png";
  if (url.startsWith("http")) return url;
  const cleanUrl = url.replace(/^undefined/, "");
  const normalized = cleanUrl.startsWith("/") ? cleanUrl : `/${cleanUrl}`;
  return `${backend}${normalized}`;
};

const RegisterPage = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(defaultAvatar);
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const previewImage = profilePicture ? URL.createObjectURL(profilePicture) : selectedAvatar;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      setProfilePicture(file);
      setSelectedAvatar(null);
    }
  };

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setProfilePicture(null);
  };

  const getAvatarFile = async (avatarUrl: string): Promise<File> => {
    const response = await fetch(avatarUrl);
    const blob = await response.blob();
    const name = avatarUrl.includes("male") ? "male-avatar.png" : "female-avatar.png";
    return new File([blob], name, { type: "image/png" });
  };

  const validateInputs = () => {
    const result = registerSchema.safeParse({ username, email, password });
    if (!result.success) {
      const newErrors: typeof errors = {};
      result.error.errors.forEach((err) => {
        newErrors[err.path[0] as keyof typeof errors] = err.message;
      });
      setErrors(newErrors);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateInputs()) return;

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("password", password);

    if (profilePicture) {
      formData.append("profilePicture", profilePicture);
    } else if (selectedAvatar) {
      const avatarFile = await getAvatarFile(selectedAvatar);
      formData.append("profilePicture", avatarFile);
    }

    try {
      const response = await apiClient.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.status === 201) {
        setSuccessMessage("✅ Registration successful! Logging you in...");
        setErrorMessage("");

        await new Promise((res) => setTimeout(res, 1000));

        const loginResponse = await apiClient.post("/auth/login", {
          username,
          password,
        });

        const userData = loginResponse.data;

        // ✅ Fix the profile picture path right after login
        userData.profilePicture = formatProfilePictureUrl(userData.profilePicture);

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        setSuccessMessage("✅ Logged in! Redirecting to your dashboard...");
        setTimeout(() => navigate("/dashboard"), 2000);
      } else {
        setErrorMessage(response.data.message || "❌ Registration failed");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setErrorMessage(error.response?.data?.message || "❌ Registration failed");
      } else {
        setErrorMessage("❌ An unexpected error occurred");
      }
    }
  };

  const googleSignin = async (credentialResponse: CredentialResponse) => {
    const { credential } = credentialResponse;
    if (!credential) throw new Error("Missing Google credential");

    const response = await apiClient.post("/auth/google", { credential });
    return response.data;
  };

  const onGoogleLoginSuccess = async (credentialResponse: CredentialResponse) => {
    try {
      const res = await googleSignin(credentialResponse);
      localStorage.setItem("user", JSON.stringify(res));
      setUser(res);
      setSuccessMessage("✅ Google login successful! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const onGoogleLoginError = () => console.error("Google login failed");

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Your Account</h2>

        <div className="profile-picture-container">
          <img src={previewImage || ""} alt="Profile Preview" className="profile-picture" />
        </div>

        <div className="avatar-selection">
          <h4>Choose an Avatar (Optional)</h4>
          <div className="avatar-options">
            <img src={maleAvatar} alt="Male Avatar" className={`avatar-option ${selectedAvatar === maleAvatar ? "selected" : ""}`} onClick={() => handleAvatarSelect(maleAvatar)} />
            <img src={femaleAvatar} alt="Female Avatar" className={`avatar-option ${selectedAvatar === femaleAvatar ? "selected" : ""}`} onClick={() => handleAvatarSelect(femaleAvatar)} />
          </div>
        </div>

        <div className="upload-button-container">
          <label htmlFor="profile-picture" className="upload-button">
            <i className="fas fa-upload"></i> Upload Profile Picture
          </label>
          <input type="file" id="profile-picture" className="d-none" onChange={handleFileChange} accept="image/*" />
        </div>

        <form onSubmit={handleRegister} className="register-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input type="text" className={`form-control ${errors.username ? "is-invalid" : ""}`} value={username} onChange={(e) => setUsername(e.target.value)} />
            {errors.username && <div className="invalid-feedback">{errors.username}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input type="email" className={`form-control ${errors.email ? "is-invalid" : ""}`} value={email} onChange={(e) => setEmail(e.target.value)} />
            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className={`form-control ${errors.password ? "is-invalid" : ""}`} value={password} onChange={(e) => setPassword(e.target.value)} />
            {errors.password && <div className="invalid-feedback">{errors.password}</div>}
          </div>

          <button type="submit" className="btn btn-primary">Register</button>

          {successMessage && (
            <div className="alert alert-success text-center mt-3">{successMessage}</div>
          )}
          {errorMessage && (
            <div className="alert alert-danger text-center mt-2">{errorMessage}</div>
          )}
        </form>

        <p className="mt-3">Already have an account? <Link to="/login">Login here</Link></p>

        <GoogleLogin onSuccess={onGoogleLoginSuccess} onError={onGoogleLoginError} theme="outline" size="large" />
      </div>
    </div>
  );
};

export default RegisterPage;