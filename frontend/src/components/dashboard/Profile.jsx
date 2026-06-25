import React, { useContext, useState } from "react";
import Sidebar from "../layout/Sidebar";
import Topbar from "../layout/Topbar";
import { AuthContext } from "../../context/AuthContext";
import API from "../../api/axiosConfig";

export default function Profile() {
  const { user, updateUser } = useContext(AuthContext);
  const API_URL =
  (process.env.REACT_APP_API_URL || "https://thyroid-diagnosis-system.onrender.com/api")
    .replace("/api", "");

  const [isCollapsed, setIsCollapsed] = useState(false);

  // 🧠 Local user state
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [email] = useState(user?.email || "");

  // 🧠 Profile image setup
  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(
    user?.profileImage
      ? `${API_URL}${
          user.profileImage.startsWith("/uploads")
            ? user.profileImage
            : user.profileImage.replace(/^.*uploads/, "/uploads")
        }`
      : "/default-avatar.png"
  );

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // 🟣 Image preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setProfileImage(file);
    if (file) setPreview(URL.createObjectURL(file));
  };

  // 🟣 Save profile changes
  const handleSaveProfile = async () => {
    setMsg("");
    setErr("");
    setLoading(true);

    try {
      const form = new FormData();
      form.append("firstName", firstName);
      form.append("lastName", lastName);
      form.append("gender", gender);
      form.append("phone", phone);
      if (profileImage) form.append("profileImage", profileImage);

      const token = localStorage.getItem("token");

      const res = await API.post("/auth/update-profile", form, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const updatedUser = res.data.user;

      updateUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      if (updatedUser.profileImage) {
        setPreview(`${API_URL}${updatedUser.profileImage}`);
      }

      setMsg("Profile updated successfully!");
    } catch (error) {
      console.error(error);
      setErr(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  // 🟣 Change password
  const handlePasswordChange = async () => {
    setMsg("");
    setErr("");
    if (newPassword !== confirmPassword) {
      setErr("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await API.post(
        "/auth/change-password",
        { oldPassword, newPassword },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setMsg("Password changed successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      setErr(error?.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  // 🟣 Password strength
  const passwordStrength = (pass) => {
    if (pass.length < 6) return "Weak";
    if (/[A-Z]/.test(pass) && /\d/.test(pass) && /[!@#$%^&*]/.test(pass))
      return "Strong";
    return "Medium";
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* ✅ Fixed Sidebar (collapsible) */}
      <Sidebar onToggle={setIsCollapsed} />

      {/* ✅ Content shifts based on sidebar state */}
      <div
        className={`flex-1 transition-all duration-300 ${
          isCollapsed ? "ml-20" : "ml-72"
        }`}
      >
        <Topbar>
          <h1 className="text-2xl font-bold">Profile</h1>
        </Topbar>

        <main className="max-w-4xl mx-auto p-8 space-y-8">
          {msg && (
            <div className="p-3 bg-green-100 text-green-700 rounded">{msg}</div>
          )}
          {err && (
            <div className="p-3 bg-red-100 text-red-700 rounded">{err}</div>
          )}

          {/* Personal Info */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>

            <div className="flex items-center gap-6 mb-4">
  <div className="relative group">
    {preview && preview !== "/default-avatar.png" ? (
      // ✅ Show uploaded or saved image
      <img
        src={preview}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border-2 border-purple-500 shadow-sm transition-transform group-hover:scale-105"
      />
    ) : (
      // ✅ Show initials if no image
      <div className="w-24 h-24 rounded-full bg-purple-600 flex items-center justify-center text-white text-3xl font-semibold shadow-sm">
        {user?.firstName?.[0]?.toUpperCase() || "U"}
        {user?.lastName?.[0]?.toUpperCase() || ""}
      </div>
    )}

    {/* Invisible file input to update image */}
    <input
      type="file"
      accept="image/*"
      onChange={handleImageChange}
      className="absolute bottom-0 left-0 opacity-0 w-full h-full cursor-pointer"
      title="Change Photo"
    />
  </div>

  <p className="text-sm text-gray-500">
    Click your photo to update it.
  </p>
</div>


            <div className="grid grid-cols-2 gap-4">
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First Name"
                className="p-3 rounded border bg-gray-50"
              />
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last Name"
                className="p-3 rounded border bg-gray-50"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="p-3 rounded border bg-gray-50"
              >
                <option value="">Select Gender</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
              </select>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone Number"
                className="p-3 rounded border bg-gray-50"
              />
            </div>

            <div className="mt-4">
              <input
                value={email}
                readOnly
                className="w-full p-3 rounded border bg-gray-100 text-gray-500 cursor-not-allowed"
              />
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>

          {/* Password Change */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-4">Change Password</h3>
            <input
              type={showPass ? "text" : "password"}
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full p-3 rounded border bg-gray-50 mb-3"
            />
            <input
              type={showPass ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-3 rounded border bg-gray-50 mb-3"
            />
            <input
              type={showPass ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full p-3 rounded border bg-gray-50 mb-3"
            />

            {newPassword && (
              <p
                className={`text-sm ${
                  passwordStrength(newPassword) === "Strong"
                    ? "text-green-600"
                    : passwordStrength(newPassword) === "Medium"
                    ? "text-yellow-600"
                    : "text-red-600"
                }`}
              >
                Password Strength: {passwordStrength(newPassword)}
              </p>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPass}
                  onChange={() => setShowPass(!showPass)}
                />
                <label className="text-sm text-gray-600">Show Passwords</label>
              </div>
              <button
                onClick={handlePasswordChange}
                className="px-6 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
