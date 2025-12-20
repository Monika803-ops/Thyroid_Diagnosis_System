// ✅ src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Load saved session (if exists)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // ✅ Auto logout if user manually opened website
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    // 🟣 Only allow auto-login when on /auth
    if (!savedUser || !savedToken) {
      if (!location.pathname.startsWith("/auth")) {
        // logout user automatically
        localStorage.clear();
        setUser(null);
        setToken(null);
        navigate("/auth", { replace: true });
      }
    }
  }, [navigate, location]);

  // ✅ Login
  const login = (userObj, tokenValue) => {
    localStorage.setItem("user", JSON.stringify(userObj));
    localStorage.setItem("token", tokenValue);
    setUser(userObj);
    setToken(tokenValue);
    navigate("/dashboard", { replace: true });
  };

  // ✅ Logout
  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
    navigate("/auth", { replace: true });
  };

  // ✅ Update
  const updateUser = (data) => {
    const updated = { ...(user || {}), ...data };
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  };

  // ✅ Signup redirect
  const signup = () => {
    alert("✅ Account created successfully! Please log in.");
    navigate("/auth", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, signup, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
