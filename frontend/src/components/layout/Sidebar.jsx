import React, { useContext, useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  Settings,
  Info,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar({ onToggle }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/auth");
  };

  // Notify parent layout when collapsed/expanded
  useEffect(() => {
    if (onToggle) onToggle(isCollapsed);
  }, [isCollapsed, onToggle]);

  const BASE_URL = "http://127.0.0.1:5000";
  const profileImage =
    user?.profileImage &&
    (user.profileImage.startsWith("http")
      ? user.profileImage
      : `${BASE_URL}/${user.profileImage.replace(/\\/g, "/")}`);

  const menuItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/chat", label: "Chatbot", icon: MessageSquare },
    { to: "/settings", label: "Settings", icon: Settings },
    { to: "/about", label: "About", icon: Info },
  ];

  return (
    <div
      className={`fixed top-0 left-0 bottom-0 z-40
        ${isCollapsed ? "w-20" : "w-72"}
        bg-[#181A1F] text-gray-100 flex flex-col justify-between
        border-r border-gray-800 transition-all duration-300`}
    >
      {/* Header */}
      <div className="px-5 py-5 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center font-bold text-white">
            ∿
          </div>
          {!isCollapsed && (
            <span className="text-lg font-semibold tracking-wide">
              Thyroid AI
            </span>
          )}
        </div>

        {/* Collapse Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-5 bg-gray-200 dark:bg-gray-800 hover:bg-purple-600 hover:text-white border border-gray-400 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-md shadow-md p-1.5 transition-all duration-300"
        >
          {isCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col justify-start py-5 px-3 space-y-1 overflow-hidden">
        {menuItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={label}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? "bg-purple-700 text-white shadow-md"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`
            }
          >
            <Icon size={20} className="text-purple-400 group-hover:text-purple-300" />
            {!isCollapsed && <span className="text-sm font-medium">{label}</span>}
          </NavLink>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-800 p-4 mt-auto">
        <div className="flex items-center gap-3">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border border-gray-700 shadow-sm"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-purple-600 flex items-center justify-center text-white text-sm font-semibold">
              {user?.firstName?.[0]?.toUpperCase() || "U"}
            </div>
          )}

          {!isCollapsed && (
            <div>
              <div className="text-sm font-semibold">
                {(user?.firstName + " " + user?.lastName) || "Guest"}
              </div>
              <div className="text-xs text-gray-400">{user?.email}</div>
            </div>
          )}
        </div>

        <button
          onClick={handleLogout}
          className={`mt-4 flex items-center gap-2 px-3 py-2 w-full rounded-lg text-sm transition-all duration-300 ${
            isCollapsed
              ? "justify-center bg-gray-800 hover:bg-purple-700"
              : "bg-gray-800 hover:bg-purple-700"
          }`}
        >
          <LogOut size={18} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );
}
