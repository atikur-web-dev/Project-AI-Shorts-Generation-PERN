
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { User } from "../types";
import { authService } from "../services/authService";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
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

  /**
   * Login
   *
   * Stores the authenticated user in React state
   * and stores the access token in localStorage.
   */
  const login = (userData: User, token: string) => {
    setUser(userData);
    authService.setAccessToken(token);

    // Keep admin session information in sync.
    if (userData.role === "ADMIN") {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem(
        "adminUser",
        JSON.stringify(userData),
      );
      localStorage.setItem("adminEmail", userData.email);
    } else {
      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminEmail");
    }
  };

  /**
   * Logout
   */
  const logout = () => {
    setUser(null);

    authService.clearAccessToken();

    // Clear admin-specific session data as well.
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("adminUser");
    localStorage.removeItem("adminEmail");
  };

  /**
   * Check whether the existing access token is still valid.
   */
  const checkAuth = async () => {
    try {
      const token = authService.getAccessToken();

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      const response = await authService.getMe();

      if (response.success && response.user) {
        setUser(response.user);

        // Synchronize admin state after page refresh.
        if (response.user.role === "ADMIN") {
          localStorage.setItem("isAdmin", "true");
          localStorage.setItem(
            "adminUser",
            JSON.stringify(response.user),
          );
          localStorage.setItem(
            "adminEmail",
            response.user.email,
          );
        } else {
          localStorage.removeItem("isAdmin");
          localStorage.removeItem("adminUser");
          localStorage.removeItem("adminEmail");
        }
      } else {
        setUser(null);
        authService.clearAccessToken();

        localStorage.removeItem("isAdmin");
        localStorage.removeItem("adminUser");
        localStorage.removeItem("adminEmail");
      }
    } catch (error) {
      console.error("Auth check failed:", error);

      setUser(null);
      authService.clearAccessToken();

      localStorage.removeItem("isAdmin");
      localStorage.removeItem("adminUser");
      localStorage.removeItem("adminEmail");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
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

  if (context === undefined) {
    throw new Error(
      "useAuth must be used within an AuthProvider",
    );
  }

  return context;
};
