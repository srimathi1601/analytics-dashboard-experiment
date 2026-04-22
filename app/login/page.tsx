"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    await new Promise((r) => setTimeout(r, 400));

    const result = login(username.trim(), password);
    if (result.success) {
      router.push("/dashboard");
      router.refresh();
    } else {
      setError(result.error || "Login failed");
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-grid px-4"
      style={{ background: "#030712" }}
    >
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 70%)",
        }}
      />

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z"
                  fill="white"
                  opacity="0.9"
                />
              </svg>
            </div>
            <span
              className="text-xl font-semibold"
              style={{
                background: "linear-gradient(135deg, #818cf8, #22d3ee)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Analytics Admin
            </span>
          </div>
          <p className="text-sm" style={{ color: "rgba(241,245,249,0.4)" }}>
            Sign in to access the dashboard
          </p>
        </div>

        {/* Card */}
        <div
          className="glass-card p-8"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <h1 className="text-xl font-semibold text-slate-100 mb-6">Welcome back</h1>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "rgba(241,245,249,0.5)" }}>
                USERNAME
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                autoComplete="username"
                className="w-full px-4 py-3 rounded-xl text-sm text-slate-100 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgba(99,102,241,0.5)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                }
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-2" style={{ color: "rgba(241,245,249,0.5)" }}>
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm text-slate-100 outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgba(99,102,241,0.5)")
                  }
                  onBlur={(e) =>
                    (e.target.style.borderColor = "rgba(255,255,255,0.08)")
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
                  style={{ color: "rgba(241,245,249,0.3)" }}
                >
                  {showPassword ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#f87171",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="12" y1="8" x2="12" y2="12"/>
                  <line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
              style={{
                background: loading
                  ? "rgba(99,102,241,0.4)"
                  : "linear-gradient(135deg, #6366f1, #22d3ee)",
                color: "white",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 0 20px rgba(99,102,241,0.3)",
              }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" opacity="0.25"/>
                    <path d="M21 12a9 9 0 00-9-9"/>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Hint */}
          {/* <div
            className="mt-5 px-4 py-3 rounded-xl text-xs"
            style={{
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.15)",
              color: "rgba(241,245,249,0.4)",
            }}
          >
            <span style={{ color: "rgba(129,140,248,0.7)" }}>Admin credentials:</span>{" "}
            username: <span className="font-mono" style={{ color: "rgba(241,245,249,0.65)" }}>admin</span>{" "}
            / password: <span className="font-mono" style={{ color: "rgba(241,245,249,0.65)" }}>admin@123</span>
          </div> */}
        </div>

        {/* Register link */}
        <p className="text-center mt-5 text-sm" style={{ color: "rgba(241,245,249,0.35)" }}>
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium transition-colors"
            style={{ color: "rgba(129,140,248,0.8)" }}
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
