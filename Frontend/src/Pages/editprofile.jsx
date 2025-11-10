import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { HashLoader } from "react-spinners";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";

const BACKEND_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState({
    profileImage: "",
    fullName: "",
    email: "",
    phone: "",
    address: "",
    dob: "",
    gender: "",
    role: "",
    bio: "",
  });

  // Load saved user
  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = JSON.parse(localStorage.getItem("user"));
      if (saved) setUser(saved);
      setLoading(false);
    }, 800);

    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Please login first!");

    try {
      const res = await fetch(`${BACKEND_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        alert("✅ Profile updated successfully!");
        navigate("/profile");
      } else {
        alert(data.message || "❌ Update failed.");
      }
    } catch (err) {
      alert("❌ Something went wrong.");
    }
  };

  const getInitials = (name) => {
    const parts = name?.trim()?.split(" ");
    if (!parts?.length) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <HashLoader color="#070A52" size={80} />
      </div>
    );
  }

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gradient-to-br from-[#eef3ff] to-[#dae3ff] flex items-center justify-center p-6">
        <div className="bg-white shadow-xl rounded-2xl w-full max-w-3xl p-8">

          <h2 className="text-3xl font-bold text-center text-blue-700 mb-8">
            Edit Profile
          </h2>

          {/* Avatar */}
          <div className="flex flex-col items-center mb-6">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                className="w-32 h-32 rounded-full border-4 border-blue-300 shadow-md object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center text-4xl font-bold shadow-md">
                {getInitials(user.fullName)}
              </div>
            )}

            <p className="text-xs mt-2 text-gray-500">
              Profile photo controlled from backend
            </p>
          </div>

          {/* Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Full Name" name="fullName" value={user.fullName} onChange={handleChange} />
            <Input label="Email" name="email" value={user.email} onChange={handleChange} />
            <Input label="Phone" name="phone" value={user.phone} onChange={handleChange} />
            <Input label="Date of Birth" name="dob" type="date" value={user.dob} onChange={handleChange} />
            <Select label="Gender" name="gender" value={user.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
            <Input label="Role" name="role" value={user.role} onChange={handleChange} />
            <Input label="Address" name="address" value={user.address} onChange={handleChange} />
          </div>

          {/* Bio */}
          <div className="mt-4">
            <label className="block text-gray-700 text-sm mb-1">Bio</label>
            <textarea
              name="bio"
              rows="3"
              value={user.bio}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-blue-400 resize-none"
              placeholder="Write about yourself..."
            />
          </div>

          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-4">
            <button
              onClick={handleSave}
              className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
            >
              Save Changes
            </button>
            <button
              onClick={() => navigate("/profile")}
              className="px-5 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

function Input({ label, name, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm mb-1">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-blue-400"
        required
      />
    </div>
  );
}

function Select({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-gray-700 text-sm mb-1">{label}</label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:outline-blue-400"
        required
      >
        <option value="">Choose</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}
