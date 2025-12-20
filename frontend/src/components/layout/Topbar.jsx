// src/components/layout/Topbar.jsx
import React from "react";

export default function Topbar({ children }) {
  return (
    <div className="flex-1">
      <div className="bg-white border-b shadow-sm p-4">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
