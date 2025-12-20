// ✅ src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthPage from "./components/auth/AuthPage";
import Dashboard from "./components/dashboard/Dashboard";
import Profile from "./components/dashboard/Profile";
import Chat from "./components/dashboard/Chat";
import About from "./components/dashboard/About";
import Settings from "./components/dashboard/Settings";
import ProtectedRoute from "./components/common/ProtectedRoute";
import "./index.css";

export default function App() {
  return (
    <Routes>
      {/* ✅ Redirect root to login page instead of dashboard */}
      <Route path="/" element={<Navigate to="/auth" replace />} />

      {/* Public route */}
      <Route path="/auth" element={<AuthPage />} />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/chat"
        element={
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        }
      />

      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        }
      />

      <Route
        path="/about"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />

      {/* 404 fallback */}
      <Route path="*" element={<div className="p-8">404 — Not Found</div>} />
    </Routes>
  );
}
