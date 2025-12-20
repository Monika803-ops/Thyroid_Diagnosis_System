import React, { useState, useContext } from "react";
import API from "../../api/axiosConfig";
import { AuthContext } from "../../context/AuthContext"; // ✅ import AuthContext

export default function UploadCard({ setPrediction }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const { user } = useContext(AuthContext); // ✅ get current logged-in user

  // Handle file selection and preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setPreview(URL.createObjectURL(selectedFile));
    } else {
      setPreview(null);
    }
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setErr("Please select an image before predicting.");
      return;
    }
    setErr("");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("image", file);
      form.append("email", user?.email || "guest"); // ✅ send email with prediction

      const res = await API.post("/predict", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setPrediction(res.data);
    } catch (error) {
      console.error("Prediction error:", error);
      setErr(error?.response?.data?.message || "Prediction failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 className="text-xl font-semibold mb-2">Upload Scan</h3>
      <p className="text-sm text-gray-500 mb-4">
        Select a thyroid scan image (JPG, PNG, max 10MB)
      </p>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="mb-3"
        />

        {/* ✅ Show preview */}
        {preview && (
          <div className="mb-4">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-contain border rounded-lg"
            />
          </div>
        )}

        {err && <div className="text-red-600 text-sm mb-2">{err}</div>}

        <button
          className="w-full py-3 rounded-lg bg-purple-600 text-white font-semibold hover:bg-purple-700 transition"
          disabled={loading}
        >
          {loading ? "Predicting..." : "Predict"}
        </button>
      </form>
    </div>
  );
}
