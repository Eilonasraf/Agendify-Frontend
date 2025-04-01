import React, {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";
import apiClient from "../services/api-client";
import { AxiosError } from "axios";

// Types
const backend_url = import.meta.env.VITE_API_BASE_URL;

export interface User {
  _id: string;
  username: string;
  email: string;
  profilePicture: string;
  accessToken: string;
  refreshToken: string;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (username: string, password: string) => Promise<void>;
  register: (formData: FormData) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
  updateProfile: (updatedData: FormData) => Promise<void>;
}

// Create Context
export const AuthContext = createContext<AuthContextType | null>(null);

// Hook to use context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // On load: check localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser: User = JSON.parse(storedUser);

      if (parsedUser.profilePicture) {
        if (parsedUser.profilePicture.includes("googleusercontent.com")) {
          // keep as-is
        } else if (parsedUser.profilePicture.startsWith("/uploads/")) {
          parsedUser.profilePicture = `${backend_url}${parsedUser.profilePicture}`;
        }
      } else {
        parsedUser.profilePicture = "/default-avatar.png";
      }

      setUser(parsedUser);
    }
  }, []);

  // Login
  const login = async (username: string, password: string) => {
    try {
      const response = await apiClient.post<User>("/auth/login", { username, password });
      const userData = response.data;

      if (userData.profilePicture && !userData.profilePicture.startsWith("http")) {
        userData.profilePicture = `${backend_url}${userData.profilePicture}`;
      }

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch {
      throw new Error("Login failed");
    }
  };

  // Register
  const register = async (formData: FormData) => {
    try {
      await apiClient.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      window.location.href = "/login";
    } catch (error) {
      const axiosError = error as AxiosError;
      throw new Error(
        (axiosError.response?.data as { message: string })?.message || "Registration failed"
      );
    }
  };

  // Update Profile
  const updateProfile = async (updatedData: FormData) => {
    if (!user) return;

    // eslint-disable-next-line no-useless-catch
    try {
      const res = await apiClient.put(`/auth/update-profile/${user._id}`, updatedData, {
        headers: { Authorization: `JWT ${user.accessToken}` },
      });

      const updatedUser: User = res.data;

      if (updatedUser.profilePicture && !updatedUser.profilePicture.startsWith("http")) {
        updatedUser.profilePicture = `${backend_url}${updatedUser.profilePicture}`;
      }

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      throw error;
    }
  };

  // Refresh Token
  const refreshAccessToken = async (): Promise<string | null> => {
    if (!user?.refreshToken) {
      logout();
      return null;
    }

    try {
      const res = await apiClient.post<{ accessToken: string }>("/auth/refresh-token", {
        token: user.refreshToken,
      });

      const newAccessToken = res.data.accessToken;
      const updatedUser = { ...user, accessToken: newAccessToken };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return newAccessToken;
    } catch {
      logout();
      return null;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        refreshAccessToken,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};