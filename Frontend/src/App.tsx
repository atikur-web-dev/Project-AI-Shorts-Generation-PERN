// Frontend/src/App.tsx

import React from "react";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import LoadingSpinner from "./components/LoadingSpinner";
import About from "./pages/About";
import Services from "./pages/Services";
import Contact from "./pages/Contact";
import Subscriptions from "./pages/Subscriptions";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import CreateProject from "./pages/CreateProject";
import Callback from "./pages/Callback";
import AdminRevenueReport from "./pages/AdminRevenueReport";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminSubscriptions from "./pages/AdminSubscriptions";
import AdminProjects from "./pages/AdminProjects";

/**
 * Protected routes for normal users.
 */
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Public routes for normal users.
 *
 * If a normal user is already authenticated,
 * redirect them to the dashboard.
 *
 * IMPORTANT:
 * Admin authentication is NOT handled here.
 */
const PublicRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

/**
 * Protected routes for administrators.
 *
 * Authorization is based on the actual authenticated
 * user stored in AuthContext, not merely localStorage.
 */

const AdminRoute: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const { user, loading } = useAuth();

  // Wait until AuthContext finishes restoring
  // the authentication state.
  if (loading) {
    return <LoadingSpinner />;
  }

  // No authenticated user.
  // Send them to the normal login page because
  // admin login is handled from the Administrator
  // modal inside LoginPage.
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated user exists, but they are not an admin.
  if (user.role !== "ADMIN") {
    return <Navigate to="/dashboard" replace />;
  }

  // Authenticated administrator.
  return <>{children}</>;
};

/**
 * Controls whether the normal Navbar is displayed.
 *
 * Admin pages use their own layout/navigation.
 */
const AppLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin") ||
    location.pathname === "/admin-login";

  return (
    <div className="min-h-screen">
      {!isAdminRoute && <Navbar />}

      {children}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppLayout>
          <Routes>
            {/* =====================================================
                PUBLIC ROUTES
            ====================================================== */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />{" "}
            <Route path="/services" element={<Services />} />{" "}
            <Route path="/contact" element={<Contact />} />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route path="/callback" element={<Callback />} />
            {/* =====================================================
                USER PROTECTED ROUTES
            ====================================================== */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/create-project"
              element={
                <ProtectedRoute>
                  <CreateProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute>
                  <Subscriptions />
                </ProtectedRoute>
              }
            />
            {/* =====================================================
                ADMIN LOGIN
            ====================================================== */}
            <Route path="/admin-login" element={<AdminLogin />} />
            {/* =====================================================
                ADMIN PROTECTED ROUTES
            ====================================================== */}
            {/* Main Admin Dashboard */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            {/* Admin Dashboard Alias */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            {/* Admin Users */}
            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />
            {/* Admin Orders */}
            <Route
              path="/admin/orders"
              element={
                <AdminRoute>
                  <AdminOrders />
                </AdminRoute>
              }
            />
            {/* Admin Subscriptions */}
            <Route
              path="/admin/subscriptions"
              element={
                <AdminRoute>
                  <AdminSubscriptions />
                </AdminRoute>
              }
            />
            {/* Admin Projects */}
            <Route
              path="/admin/projects"
              element={
                <AdminRoute>
                  <AdminProjects />
                </AdminRoute>
              }
            />
            <Route
              path="/admin/reports/revenue"
              element={
                <AdminRoute>
                  <AdminRevenueReport />
                </AdminRoute>
              }
            />
            {/* =====================================================
                UNKNOWN ROUTES
            ====================================================== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AuthProvider>
  );
}

export default App;
