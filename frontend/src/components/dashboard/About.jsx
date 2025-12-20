// src/components/dashboard/About.jsx
import React, { useState } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";

export default function About() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar (fixed + collapsible) */}
      <Sidebar onToggle={setIsCollapsed} />

      {/* Main content that shifts beside sidebar */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        {/* Topbar */}
        <Topbar>
          <h1 className="text-2xl font-bold">About</h1>
        </Topbar>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto p-8 space-y-8">
          {/* Overview Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
            <h1 className="text-3xl font-bold text-purple-700 mb-4">
              About Thyroid AI
            </h1>
            <p className="text-gray-700 leading-relaxed text-justify">
              <strong>Thyroid AI</strong> is an intelligent web application
              designed to assist in the <strong>early detection</strong> and
              <strong> understanding of thyroid disorders</strong> using
              Artificial Intelligence. It analyzes uploaded thyroid test reports
              or scan images to predict possible conditions like{" "}
              <em>Hyperthyroidism</em>, <em>Hypothyroidism</em>,{" "}
              <em>Thyroid Nodules</em>, <em>Thyroiditis</em>, or{" "}
              <em>Thyroid Cancer</em>.
            </p>

            <p className="mt-4 text-gray-700 leading-relaxed text-justify">
              This project aims to provide an easy-to-use platform for users to
              understand their thyroid health better. By integrating AI-driven
              predictions with an interactive chatbot, users can receive
              insights, guidance, and awareness about their condition — helping
              them make informed decisions before consulting medical experts.
            </p>
          </div>

          {/* Features Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">
              Key Features
            </h2>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>
                🧠 <strong>AI-Based Prediction:</strong> Upload thyroid reports
                or scans to get instant condition predictions with confidence
                scores.
              </li>
              <li>
                💬 <strong>Chatbot Assistant:</strong> Ask AI questions about
                symptoms, diagnosis, or treatment of thyroid disorders.
              </li>
              <li>
                📊 <strong>Interactive Dashboard:</strong> View and track your
                previous prediction history with timestamps and confidence.
              </li>
              <li>
                👤 <strong>User Profile Management:</strong> Update personal
                details, change password, and upload your profile photo.
              </li>
              <li>
                🔒 <strong>Secure Authentication:</strong> User data is protected
                through token-based authentication.
              </li>
              <li>
                ⚙️ <strong>Settings & Customization:</strong> Control how AI
                predictions and chat behave.
              </li>
            </ul>
          </div>

          {/* Technology Stack Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200">
            <h2 className="text-2xl font-semibold text-purple-700 mb-4">
              Technology Stack
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-gray-700">
              <div className="p-3 bg-gray-100 rounded-lg shadow-sm text-center">
                ⚛️ React.js (Frontend)
              </div>
              <div className="p-3 bg-gray-100 rounded-lg shadow-sm text-center">
                🐍 Flask (Backend API)
              </div>
              <div className="p-3 bg-gray-100 rounded-lg shadow-sm text-center">
                🤖 TensorFlow  (AI Model)
              </div>
              <div className="p-3 bg-gray-100 rounded-lg shadow-sm text-center">
                🧩 Axios (API Integration)
              </div>
              <div className="p-3 bg-gray-100 rounded-lg shadow-sm text-center">
                🗄️ SQLite  (Database)
              </div>
              <div className="p-3 bg-gray-100 rounded-lg shadow-sm text-center">
                🎨 Tailwind CSS (UI Styling)
              </div>
            </div>
          </div>

          {/* Developer Section */}
          <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-200 text-center">
            <h2 className="text-2xl font-semibold text-purple-700 mb-3">
              Developers
            </h2>
            <p className="text-gray-700 text-lg font-medium">
              Project Developed by
            </p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4 text-gray-800 font-semibold">
              <div>👩‍💻 Monika N V</div>
              <div>👩‍💻 Niveditha H R</div>
              <div>👩‍💻 Pranathi V C</div>
              <div>👩‍💻 Spandana K H</div>
            </div>

            <p className="text-gray-500 text-sm mt-4">
              Final Year Computer Science Students, KIT – Tiptur
            </p>
            
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm mt-10 mb-4">
            © {new Date().getFullYear()} Thyroid AI. All Rights Reserved.
          </div>
        </main>
      </div>
    </div>
  );
}
