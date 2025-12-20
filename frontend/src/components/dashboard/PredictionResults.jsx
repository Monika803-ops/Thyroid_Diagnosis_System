// src/components/dashboard/PredictionResults.jsx
import React from "react";

export default function PredictionResults({ prediction }) {
  if (!prediction) {
    return (
      <div className="card">
        <h3 className="text-xl font-semibold mb-2">Prediction Results</h3>
        <p className="text-sm text-gray-500 mb-4">
          AI analysis of your thyroid scan
        </p>

        <div className="h-48 border border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-400">
          Upload and analyze an image to see results
        </div>
      </div>
    );
  }

  const confidence = (prediction.confidence * 100).toFixed(2);

  return (
    <div className="card space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold">Prediction Results</h3>
        <p className="text-sm text-gray-500">
          AI analysis of your thyroid scan
        </p>
      </div>

      {/* Predicted Condition */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-5">
        <p className="text-sm text-gray-600 font-medium">Predicted Condition</p>
        <h2 className="text-2xl font-bold text-purple-700 capitalize">
          {prediction.label.replace(/_/g, " ")}
        </h2>
        <p className="text-gray-700 font-medium mt-1">
          Confidence: {confidence}%
        </p>
      </div>

      {/* Class Probabilities */}
      <div>
        <h4 className="text-md font-semibold text-gray-700 mb-3">
          Class Probabilities
        </h4>

        <div className="space-y-3">
          {prediction.probabilities &&
            prediction.probabilities.map((p, i) => {
              const pct = (p.prob * 100).toFixed(2);
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm font-medium text-gray-700 mb-1">
                    <span>{p.label.replace(/_/g, " ")}</span>
                    <span>{pct}%</span>
                  </div>
                  <div className="w-full bg-gray-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-2.5 bg-purple-600 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
