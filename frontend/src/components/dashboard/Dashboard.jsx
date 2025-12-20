import React, { useState } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import UploadCard from "./UploadCard";
import PredictionCard from "./PredictionCard";
import RecentPredictions from "./RecentPredictions";

export default function Dashboard() {
  const [prediction, setPrediction] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false); // Sidebar collapse state

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Sidebar (Fixed) */}
      <Sidebar onToggle={setIsCollapsed} />

      {/* ✅ Main Content Area */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        {/* Topbar */}
        <Topbar>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">
              Thyroid Diagnosis Dashboard
            </h1>
          </div>
        </Topbar>

        {/* Main Section */}
        <main className="max-w-7xl mx-auto p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Upload Card updates prediction */}
            <UploadCard setPrediction={setPrediction} />

            {/* Prediction Card displays prediction */}
            <PredictionCard prediction={prediction} />
          </div>

          {/* Recent Predictions */}
          <div className="mt-8">
            <RecentPredictions />
          </div>
        </main>
      </div>
    </div>
  );
}
