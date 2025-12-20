import React, { useState, useEffect } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import API from "../../api/axiosConfig";
import { useNavigate } from "react-router-dom";

export default function Settings() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Settings state
  const [fontSize, setFontSize] = useState(localStorage.getItem("fontSize") || "medium");

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Apply font size
  useEffect(() => {
    document.documentElement.style.fontSize =
      fontSize === "small" ? "14px" : fontSize === "large" ? "18px" : "16px";
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#000000";
  }, [fontSize]);

  // Save settings
  const handleSave = () => {
    localStorage.setItem("fontSize", fontSize);
    alert("✅ Font size saved successfully!");
  };

  // Reset to default
  const handleReset = () => {
    localStorage.removeItem("fontSize");
    setFontSize("medium");
    document.body.style.backgroundColor = "#ffffff";
    document.body.style.color = "#000000";
    alert("🔁 Settings reset to default!");
  };

  // Delete account (simple frontend placeholder)
  const handleDeleteAccount = async () => {
    try {
      const token = localStorage.getItem("token");
      await API.delete("/auth/delete-account", {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("🗑️ Account deleted successfully!");
      localStorage.clear();
      navigate("/auth");
    } catch (error) {
      console.error(error);
      alert("❌ Failed to delete account. Try again later.");
    }
  };

  return (
    <div className="flex min-h-screen bg-white text-gray-800">
      <Sidebar onToggle={setIsCollapsed} />

      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-72"
        } bg-white`}
      >
        <Topbar>
          <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        </Topbar>

        <main className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Header */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8">
            <h2 className="text-3xl font-bold mb-3 text-gray-800">
              ⚙️ Application Settings
            </h2>
            <p className="text-gray-600">
              Adjust your Thyroid AI preferences. Settings are saved locally.
            </p>
          </div>

          {/* Font Size */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-md p-8">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">🔤 Font Size</h3>
            <div className="flex gap-6">
              {["small", "medium", "large"].map((size) => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  className={`flex-1 py-3 rounded-xl border font-semibold capitalize transition-all ${
                    fontSize === size
                      ? "bg-purple-600 text-white border-purple-700"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between">
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all font-semibold shadow-md"
            >
              🔁 Reset to Default
            </button>
            <button
              onClick={handleSave}
              className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold shadow-md"
            >
              💾 Save Settings
            </button>
          </div>

          {/* ⚠️ Danger Zone - Delete Account */}
          <div className="card border-red-200 bg-red-50">
            <h3 className="text-xl font-semibold text-red-700 mb-2">
              Danger Zone
            </h3>
            <p className="text-sm text-red-500 mb-4">
              Once deleted, your account and all related data cannot be recovered.
            </p>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded"
            >
              Delete Account
            </button>
          </div>

          {/* Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                <h4 className="text-lg font-semibold mb-3">Confirm Delete</h4>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to permanently delete your account?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
