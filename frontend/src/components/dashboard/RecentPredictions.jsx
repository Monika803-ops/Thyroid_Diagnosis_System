// src/components/dashboard/RecentPredictions.jsx
import React, { useEffect, useState } from "react";
import API from "../../api/axiosConfig";

export default function RecentPredictions() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    (async function load() {
      try {
        const res = await API.get("/predictions");
        setRows(res.data || []);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-3">Recent Predictions</h3>
      {rows.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No predictions yet. Upload your first scan!</div>
      ) : (
        <div className="space-y-3">
          {rows.map((r, i) => (
            <div key={i} className="p-3 border rounded">
              <div className="flex justify-between">
                <div>{r.label}</div>
                <div className="text-sm text-gray-600">{(r.confidence*100).toFixed(1)}%</div>
              </div>
              <div className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
