"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Globe,
  Tag,
  Mail,
  TrendingUp,
  Smartphone,
  Settings,
  Zap,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Website Analytics", href: "/dashboard/website", icon: Globe },
  { label: "GTM Events", href: "/dashboard/gtm", icon: Tag },
  { label: "Email Subscribers", href: "/dashboard/email", icon: Mail },
  { label: "Marketing Analytics", href: "/dashboard/marketing", icon: TrendingUp },
  { label: "App Analytics", href: "/dashboard/app", icon: Smartphone },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="fixed left-0 top-0 h-full w-[260px] flex flex-col z-40"
      style={{
        background: "linear-gradient(180deg, rgba(9,11,23,0.98) 0%, rgba(5,8,18,0.98) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #6366f1, #22d3ee)" }}
        >
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-700 text-white tracking-wide">NEXOR</p>
          <p className="text-[10px] text-slate-500 tracking-widest uppercase">Admin Panel</p>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-6 mb-4" style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

      {/* Nav label */}
      <p className="px-6 mb-3 text-[10px] font-600 tracking-widest uppercase text-slate-600">
        Navigation
      </p>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                transition-all duration-200 group relative
                ${isActive
                  ? "nav-active text-indigo-300"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                }
              `}
            >
              <Icon
                size={16}
                className={isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"}
              />
              <span className="flex-1">{label}</span>
              {isActive && (
                <ChevronRight size={13} className="text-indigo-400 opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-6 mt-4 mb-4" style={{ height: "1px", background: "rgba(255,255,255,0.05)" }} />

      {/* Settings */}
      <div className="px-3 pb-4">
        <Link
          href="/dashboard/settings"
          className={`
            flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            transition-all duration-200 group
            ${pathname === "/dashboard/settings"
              ? "nav-active text-indigo-300"
              : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
            }
          `}
        >
          <Settings size={16} className="text-slate-500 group-hover:text-slate-300" />
          <span>Settings</span>
        </Link>
      </div>

      {/* Status indicator */}
      <div
        className="mx-4 mb-5 px-4 py-3 rounded-xl"
        style={{
          background: "rgba(52,211,153,0.08)",
          border: "1px solid rgba(52,211,153,0.15)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] text-emerald-400 font-medium">All Systems Operational</span>
        </div>
        <p className="text-[10px] text-slate-600 mt-1">Last sync: just now</p>
      </div>
    </aside>
  );
}
