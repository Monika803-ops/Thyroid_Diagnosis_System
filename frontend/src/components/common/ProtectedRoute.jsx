// ✅ src/components/common/ProtectedRoute.jsx
import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  // read from context
  const { user, token } = useContext(AuthContext);

  // ✅ also check localStorage directly
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  // ✅ If ANY session info is missing, redirect to login
  if (!user || !token || !storedUser || !storedToken) {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
