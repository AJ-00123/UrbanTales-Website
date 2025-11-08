import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HashLoader } from "react-spinners";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const logoUrl = "https://drive.google.com/uc?export=view&id=1XxU_zf3_ZBDjuEWqGorEYUgBTzjoyaW_";

// Password strength logic
function getStrength(password) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;
  if (password.length >= 12) score++;
  return score;
}

function passwordRating(score) {
  if (score <= 2) return { label: "Weak", color: "red-500", bar: "bg-red-200" };
  if (score === 3) return { label: "Good", color: "yellow-600", bar: "bg-yellow-200" };
  if (score === 4 || score === 5) return { label: "Better", color: "blue-600", bar: "bg-blue-200" };
  if (score >= 6) return { label: "Strong", color: "green-600", bar: "bg-green-200" };
  return { label: "Weak", color: "red-500", bar: "bg-red-200" };
}

export default function ResetPasswordConfirm() {
  const [password, setPassword] = useState("");
  const [cpassword, setCPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("info");
  const [loading, setLoading] = useState(false);
  const [fade, setFade] = useState(false);
  const params = new URLSearchParams(useLocation().search);
  const email = params.get("email");
  const otp = params.get("otp");
  const navigate = useNavigate();

  const score = getStrength(password);
  const { label, color, bar } = passwordRating(score);

  React.useEffect(() => {
    if (msg) {
      setFade(true);
      const t = setTimeout(() => setFade(false), 2500);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== cpassword) {
      setMsg("⚠️ Passwords do not match");
      setType("error");
      return;
    }
    if (score < 3) {
      setMsg("⚠️ Please choose a stronger password (min. 8 chars, mix of letters, numbers & a symbol)");
      setType("error");
      return;
    }
    setMsg("");
    setLoading(true);
    setType("info");
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/auth/reset-password/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, newPassword: password }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ Password reset successful! Redirecting to login...");
        setType("success");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setMsg(data.msg || "❌ Reset failed.");
        setType("error");
      }
    } catch {
      setMsg("⚠️ Server error. Try again.");
      setType("error");
    } finally {
      setLoading(false);
    }
  };

  const fadeAnim = fade && msg ? "transition-opacity duration-700 opacity-100" : "opacity-0";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-50 to-blue-50">
      <form
        className="relative space-y-7 bg-white shadow-2xl p-8 rounded-3xl w-full max-w-lg animate-fade-in"
        onSubmit={handleSubmit}
      >
        <img src={logoUrl} className="mx-auto w-36 mb-4 animate-pop" alt="UrbanTales Logo" />
        <h2 className="font-bold text-2xl mb-2 text-[#070A52] text-center">
          Set New Password
        </h2>

        {/* Password strength meter */}
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-sm font-bold text-${color}`}>
            Password strength: {label}
          </span>
          <div className={`w-28 h-3 rounded-full ${bar}`}>
            <div
              className={`h-full rounded-full bg-${color} transition-all duration-300`}
              style={{ width: `${(score / 6) * 100}%` }}
            ></div>
          </div>
        </div>
        {/* Password tips */}
        <div className="text-xs text-blue-800 bg-blue-50 rounded px-2 py-1 mb-2 flex items-center gap-2">
          <svg width={18} height={18} className="text-blue-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.75 21a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5zm0 0v3M12 3v3M6.75 6.75H3m18 0H17.25"/></svg>
          Use min. 8 characters with uppercase, lowercase, a number, and a special character.
        </div>
        <input
          type="password"
          className={`w-full border py-3 rounded-xl px-3 text-lg focus:ring-2 focus:ring-yellow-400`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="New password"
          minLength={6}
          required
          disabled={loading}
        />
        <input
          type="password"
          className={`w-full border py-3 rounded-xl px-3 text-lg focus:ring-2 focus:ring-yellow-400`}
          value={cpassword}
          onChange={(e) => setCPassword(e.target.value)}
          placeholder="Confirm password"
          minLength={6}
          required
          disabled={loading}
        />
        <button
          className="w-full py-3 bg-gradient-to-r from-[#070A52] to-[#FFCC00] text-white font-semibold rounded-xl hover:from-[#FFCC00] hover:to-[#070A52] mt-2 disabled:opacity-50"
          type="submit"
          disabled={loading}
        >
          {loading ? <HashLoader color="#fff" size={20} /> : "Update Password"}
        </button>
        {msg && (
          <div
            className={`text-center mt-2 rounded px-3 py-2 text-base
              ${
                type === "success"
                  ? "text-green-700 bg-green-100 border-l-4 border-green-400"
                  : type === "error"
                  ? "text-red-700 bg-red-100 border-l-4 border-red-400"
                  : "text-blue-700 bg-blue-100 border-l-4 border-blue-300"
              }
              ${fadeAnim}`}
          >
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}
