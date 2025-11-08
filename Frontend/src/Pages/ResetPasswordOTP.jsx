import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { HashLoader } from "react-spinners";

const BASE_API_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:3000";
const logoUrl = "https://drive.google.com/uc?export=view&id=1XxU_zf3_ZBDjuEWqGorEYUgBTzjoyaW_";

export default function ResetPasswordOTP() {
  const [otp, setOTP] = useState("");
  const [msg, setMsg] = useState("");
  const [type, setType] = useState("info"); // info/success/error for message coloring
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [fade, setFade] = useState(false);
  const params = new URLSearchParams(useLocation().search);
  const email = params.get("email");
  const navigate = useNavigate();

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  // Animation for messages
  useEffect(() => {
    if (msg) {
      setFade(true);
      const t = setTimeout(() => setFade(false), 3000);
      return () => clearTimeout(t);
    }
  }, [msg]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setLoading(true);
    setType("info");
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/auth/reset-password/verify`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("✅ OTP verified! Redirecting...");
        setType("success");
        setTimeout(
          () =>
            navigate(
              `/reset-password/confirm?email=${encodeURIComponent(
                email
              )}&otp=${otp}`
            ),
          1200
        );
      } else {
        setMsg(data.msg || "❌ Invalid or expired OTP.");
        setType("error");
      }
    } catch {
      setMsg("⚠️ Server error. Try again later.");
      setType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setMsg("");
    setType("info");
    try {
      const res = await fetch(
        `${BASE_API_URL}/api/auth/reset-password/request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg(
          "🔁 OTP resent! Please check your inbox and, if necessary, your Spam/Junk folder."
        );
        setType("success");
        setTimer(60);
      } else {
        setMsg(data.msg || "Failed to resend OTP.");
        setType("error");
      }
    } catch {
      setMsg("⚠️ Server error. Try again.");
      setType("error");
    } finally {
      setResending(false);
    }
  };

  // Animation classes
  const fadeAnim =
    fade && msg ? "transition-opacity duration-700 opacity-100" : "opacity-0";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-yellow-50 to-blue-50">
      <form
        className="relative space-y-6 bg-white shadow-2xl p-8 rounded-3xl w-full max-w-lg animate-fade-in"
        onSubmit={handleSubmit}
      >
        <img src={logoUrl} className="mx-auto w-36 mb-4 animate-pop" alt="UrbanTales" />
        <h2 className="font-bold text-2xl mb-2 text-[#070A52] text-center">
          Enter the OTP sent to your email
        </h2>

        <div className="text-sm text-blue-700 bg-blue-50 border-l-4 border-blue-400 rounded px-3 py-2 mb-2 animate-fade-in">
          OTP has been sent to your registered email. <br />
          <span className="font-medium">If you don't see it in your inbox, please check your Spam or Junk folder.</span>
        </div>

        <input
          maxLength={6}
          className="w-full border py-3 rounded-xl px-3 text-center tracking-widest text-2xl font-mono shadow-inner ring-1 ring-blue-200 focus:ring-2 focus:ring-yellow-400 transition-all"
          autoFocus
          value={otp}
          onChange={(e) => setOTP(e.target.value.replace(/\D/, ""))}
          placeholder="6-digit OTP"
          required
          disabled={loading}
        />

        <button
          className={`w-full py-3 font-semibold rounded-xl transition bg-gradient-to-r from-[#070A52] to-[#FFCC00] text-white hover:from-[#FFCC00] hover:to-[#070A52] mt-2 disabled:opacity-50 animate-bounce-short`}
          type="submit"
          disabled={loading}
        >
          {loading ? <HashLoader color="#fff" size={22} /> : "Verify OTP"}
        </button>

        <div className="text-center mt-2">
          {timer > 0 ? (
            <span className="text-gray-500 text-sm animate-pulse">
              Resend OTP in {timer}s
            </span>
          ) : (
            <button
              type="button"
              className="text-sm text-blue-600 hover:underline font-medium transition"
              onClick={handleResend}
              disabled={resending}
            >
              {resending ? (
                <span className="flex items-center justify-center">
                  <HashLoader color="#070A52" size={16} />
                  &nbsp;Resending...
                </span>
              ) : (
                "Resend OTP"
              )}
            </button>
          )}
        </div>

        {msg && (
          <div
            className={`text-center mt-2 rounded px-3 py-2 text-base
              ${type === "success"
                ? "text-green-700 bg-green-100 border-l-4 border-green-400"
                : type === "error"
                ? "text-red-700 bg-red-100 border-l-4 border-red-400"
                : "text-blue-700 bg-blue-100 border-l-4 border-blue-300"
              }
                  ${fadeAnim}
            `}
          >
            {msg}
          </div>
        )}
      </form>
    </div>
  );
}


