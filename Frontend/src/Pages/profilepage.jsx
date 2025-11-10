import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Components/Navbar";
import Footer from "../Components/Footer";
import { HashLoader } from "react-spinners";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const user = JSON.parse(localStorage.getItem("user")) || {
    fullName: "Guest User",
    email: "guest@example.com",
    phone: "0000000000",
    address: "Not added yet",
    dob: "N/A",
    gender: "N/A",
    role: "User",
    bio: "No bio added yet.",
    profileImage: "",
  };

  // Loading skeleton
  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const getInitials = (name) => {
    const parts = name?.trim()?.split(" ");
    if (!parts?.length) return "U";
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/WelcomePage");
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
      <div className="min-h-screen bg-gradient-to-br from-[#eef3ff] to-[#dae3ff] py-10 px-4 flex justify-center items-center">
        
        {/* Profile Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-lg border border-white/70 shadow-2xl rounded-3xl w-full max-w-5xl overflow-hidden p-8 md:p-10"
        >
          <div className="flex flex-col md:flex-row gap-10">

            {/* Avatar + Actions */}
            <div className="flex flex-col items-center md:w-1/3">
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover shadow-lg border-4 border-blue-500"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-blue-600 text-white flex items-center justify-center text-5xl font-bold shadow-lg">
                  {getInitials(user.fullName)}
                </div>
              )}

              <h2 className="mt-4 text-2xl font-extrabold text-gray-800 tracking-tight">
                {user.fullName}
              </h2>
              <p className="text-sm text-gray-500">{user.role}</p>

              <button
                onClick={() => navigate("/editprofile")}
                className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold shadow"
              >
                Edit Profile
              </button>

              <button
                onClick={handleLogout}
                className="mt-2 w-full py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-semibold shadow"
              >
                Logout
              </button>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <h3 className="text-xl font-bold text-blue-800 border-b pb-2 mb-5">
                Personal Information
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Info label="Email" value={user.email} />
                <Info label="Phone" value={user.phone} />
                <Info label="Address" value={user.address} />
                <Info label="Date of Birth" value={user.dob} />
                <Info label="Gender" value={user.gender} />
                <Info label="Account Type" value={user.role} />
              </div>

              <div className="mt-6">
                <h4 className="text-md font-semibold text-gray-700 mb-2">Bio</h4>
                <p className="text-sm text-gray-700 bg-white p-3 rounded-lg border shadow-sm min-h-[60px]">
                  {user.bio}
                </p>
              </div>
            </div>

          </div>
        </motion.div>
      </div>
      <Footer />
    </>
  );
}

/* Reusable Profile Info Component */
function Info({ label, value }) {
  return (
    <div className="bg-white p-3 rounded-lg border shadow-sm">
      <p className="text-xs uppercase text-gray-500 tracking-wide font-medium">{label}</p>
      <p className="text-sm font-semibold text-gray-900 mt-1 break-words">{value || "Not provided"}</p>
    </div>
  );
}
