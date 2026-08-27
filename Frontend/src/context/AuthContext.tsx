import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { User } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = (userData: User, token: string) => {
    setUser(userData);
    authService.setAccessToken(token);

    // Keep admin state synchronized.
    if (userData.role === "ADMIN") {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("adminEmail", userData.email);
      localStorage.setItem(
        "adminUser",
        JSON.stringify(userData),
      );
    } else {
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminUser");
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      setUser(null);
      authService.clearAccessToken();

      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminUser");
    }
  };

  const checkAuth = async () => {
    try {
      const token = authService.getAccessToken();

      if (!token) {
        setUser(null);
        return;
      }

      const response = await authService.getMe();

      if (response.success && response.user) {
        setUser(response.user);

        if (response.user.role === "ADMIN") {
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem(
            "adminEmail",
            response.user.email,
          );
          localStorage.setItem(
            "adminUser",
            JSON.stringify(response.user),
          );
        } else {
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("adminEmail");
          localStorage.removeItem("adminUser");
        }
      } else {
        setUser(null);
        authService.clearAccessToken();
      }
    } catch (error) {
      console.error("Auth check failed:", error);

      setUser(null);
      authService.clearAccessToken();

      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminEmail");
      localStorage.removeItem("adminUser");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }

  return context;
};