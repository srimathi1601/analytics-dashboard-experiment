"use client";

import { Bell, Search, RefreshCw, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { logout, getSession } from "@/lib/auth";

interface TopBarProps {
  title: string;
  subtitle?: string;
}

export default function TopBar({ title, subtitle }: TopBarProps) {
  const router = useRouter();
  const session = getSession();
  const initials = session?.username?.slice(0, 2).toUpperCase() ?? "A";

  function handleLogout() {
    logout();
    router.push("/login");
    router.refresh();
  }

  return (
    <div
      className="flex items-center justify-between px-6 py-4 sticky top-0 z-30"
      style={{
        background: "rgba(3,7,18,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div>
        <h1 className="text-lg font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <Search size={13} className="text-slate-500" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent text-slate-400 placeholder-slate-600 text-xs outline-none w-32"
          />
        </div>

        {/* Refresh */}
        <button
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/8"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <RefreshCw size={13} className="text-slate-400" />
        </button>

        {/* Notifications */}
        <button
          className="relative w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/8"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <Bell size={13} className="text-slate-400" />
          <span
            className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
            style={{ background: "#f472b6" }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold"
          style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}
        >
          {initials}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-white/8"
          style={{ border: "1px solid rgba(255,255,255,0.07)" }}
        >
          <LogOut size={13} className="text-slate-400" />
        </button>
      </div>
    </div>
  );
}
