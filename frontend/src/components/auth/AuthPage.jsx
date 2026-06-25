// src/components/auth/AuthPage.jsx
import React, { useState, useContext } from "react";
import API from "../../api/axiosConfig";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function strongPassword(password) {
  // at least 8 chars, uppercase, lowercase, number, special
  const re = /(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*\W).*/;
  return re.test(password);
}

export default function AuthPage() {
  const [tab, setTab] = useState("login");
  const { login } = useContext(AuthContext);
  const nav = useNavigate();

  // login state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // signup state
  const [firstName, setFirst] = useState("");
  const [lastName, setLast] = useState("");
  const [sEmail, setSEmail] = useState("");
  const [sPassword, setSPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  // optional signup fields
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // LOGIN FUNCTION
  const doLogin = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await API.post("/auth/login", { email, password });
      login(res.data.user, res.data.token);
      nav("/dashboard");
    } catch (error) {
      setErr(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // SIGNUP FUNCTION
  const doSignup = async (e) => {
    e.preventDefault();
    setErr("");
    if (!strongPassword(sPassword)) {
      setErr("Password must be 8+ chars, include upper, lower, number and special.");
      return;
    }
    if (sPassword !== confirm) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("email", sEmail);
      formData.append("password", sPassword);
      formData.append("gender", gender);
      formData.append("phone", phone);
      if (profileImage) formData.append("profileImage", profileImage);

      await API.post("/auth/signup", formData, {
  headers: { "Content-Type": "multipart/form-data" },
});

    alert("Account created successfully! Please login.");
setTab("login");  // switch UI to login form
// Optionally force redirect:
nav("/auth");

    } catch (error) {
      setErr(error?.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center auth-bg">
      <div className="w-full max-w-2xl mx-auto p-8">
        <div className="text-center mb-6">
          <div className="text-white text-3xl font-semibold inline-flex items-center gap-3">
            
            Thyroid Diagnosis System Using Deep Learning
          </div>
        </div>

        <div className="card mx-auto max-w-md bg-white/95 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-1 text-gray-800">Welcome</h2>
          <p className="text-sm text-gray-500 mb-4">
            Sign in or create an account to get started
          </p>

          {/* Tabs */}
          <div className="flex border rounded-lg overflow-hidden mb-4">
            <button
              className={`flex-1 py-3 ${
                tab === "login" ? "bg-gray-100 font-semibold" : "text-gray-600"
              }`}
              onClick={() => setTab("login")}
            >
              Login
            </button>
            <button
              className={`flex-1 py-3 ${
                tab === "signup" ? "bg-gray-100 font-semibold" : "text-gray-600"
              }`}
              onClick={() => setTab("signup")}
            >
              Sign Up
            </button>
          </div>

          {err && (
            <div className="bg-red-50 text-red-700 p-2 rounded mb-3 text-sm">
              {err}
            </div>
          )}

          {tab === "login" ? (
            // LOGIN FORM
            <form onSubmit={doLogin}>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mb-3 p-3 rounded-lg border bg-gray-50"
                placeholder="you@example.com"
              />

              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                required
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mb-6 p-3 rounded-lg border bg-gray-50"
                placeholder="••••••••"
              />

              <button
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold disabled:opacity-70"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>
          ) : (
            // SIGNUP FORM
            <form onSubmit={doSignup}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    First Name
                  </label>
                  <input
                    value={firstName}
                    onChange={(e) => setFirst(e.target.value)}
                    className="w-full p-3 rounded-lg border bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Last Name
                  </label>
                  <input
                    value={lastName}
                    onChange={(e) => setLast(e.target.value)}
                    className="w-full p-3 rounded-lg border bg-gray-50"
                  />
                </div>
              </div>

              <label className="block text-sm font-medium mb-1 mt-4">Email</label>
              <input
                required
                type="email"
                value={sEmail}
                onChange={(e) => setSEmail(e.target.value)}
                className="w-full mb-3 p-3 rounded-lg border bg-gray-50"
              />

              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                required
                type="password"
                value={sPassword}
                onChange={(e) => setSPassword(e.target.value)}
                className="w-full mb-3 p-3 rounded-lg border bg-gray-50"
              />

              <label className="block text-sm font-medium mb-1">
                Confirm Password
              </label>
              <input
                required
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full mb-4 p-3 rounded-lg border bg-gray-50"
              />

              <p className="text-xs text-gray-500 mb-4">
                Password must be at least 8 characters with uppercase, lowercase,
                number, and special character.
              </p>

              {/* Optional Info Section */}
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Optional Profile Info
                </h3>
                <div className="space-y-3">
                  <select
                    className="w-full p-3 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-purple-400"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  >
                    <option value="">Select Gender (Optional)</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>

                  <input
                    type="tel"
                    placeholder="Phone (Optional)"
                    className="w-full p-3 border rounded-lg bg-gray-50"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />

                  <div>
                    <label className="block text-sm text-gray-600 mb-1">
                      Profile Picture (Optional)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="text-sm"
                      />
                      {preview && (
                        <img
                          src={preview}
                          alt="preview"
                          className="w-10 h-10 rounded-full object-cover border"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold mt-6"
                disabled={loading}
              >
                {loading ? "Creating..." : "Create Account"}
              </button>
            </form>
          )}
        </div>

        <p className="text-center text-white text-sm mt-6">
          For demonstration purposes only. Not a medical diagnostic tool.
        </p>
      </div>
    </div>
  );
}
