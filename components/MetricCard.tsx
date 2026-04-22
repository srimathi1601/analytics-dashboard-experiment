"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { SparklineChart } from "./Charts/SparklineChart";

interface MetricCardProps {
  title: string;
  value: string | number;
  growth: number;
  trend: number[];
  icon: React.ReactNode;
  color: "indigo" | "cyan" | "purple" | "green" | "pink" | "amber";
  prefix?: string;
  suffix?: string;
}

const colorMap = {
  indigo: {
    bg: "rgba(99,102,241,0.12)",
    border: "rgba(99,102,241,0.25)",
    iconBg: "rgba(99,102,241,0.2)",
    iconColor: "#818cf8",
    line: "#818cf8",
  },
  cyan: {
    bg: "rgba(34,211,238,0.08)",
    border: "rgba(34,211,238,0.2)",
    iconBg: "rgba(34,211,238,0.15)",
    iconColor: "#22d3ee",
    line: "#22d3ee",
  },
  purple: {
    bg: "rgba(167,139,250,0.1)",
    border: "rgba(167,139,250,0.22)",
    iconBg: "rgba(167,139,250,0.18)",
    iconColor: "#a78bfa",
    line: "#a78bfa",
  },
  green: {
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.2)",
    iconBg: "rgba(52,211,153,0.15)",
    iconColor: "#34d399",
    line: "#34d399",
  },
  pink: {
    bg: "rgba(244,114,182,0.08)",
    border: "rgba(244,114,182,0.2)",
    iconBg: "rgba(244,114,182,0.15)",
    iconColor: "#f472b6",
    line: "#f472b6",
  },
  amber: {
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.2)",
    iconBg: "rgba(251,191,36,0.15)",
    iconColor: "#fbbf24",
    line: "#fbbf24",
  },
};

export default function MetricCard({
  title,
  value,
  growth,
  trend,
  icon,
  color,
  prefix = "",
  suffix = "",
}: MetricCardProps) {
  const c = colorMap[color];
  const isPositive = growth >= 0;

  return (
    <div
      className="relative overflow-hidden rounded-2xl p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer"
      style={{
        background: `linear-gradient(135deg, ${c.bg} 0%, rgba(255,255,255,0.02) 100%)`,
        border: `1px solid ${c.border}`,
      }}
    >
      {/* Background glow orb */}
      <div
        className="absolute -right-8 -top-8 w-24 h-24 rounded-full opacity-20 blur-2xl"
        style={{ background: c.iconColor }}
      />

      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: c.iconBg }}
        >
          <span style={{ color: c.iconColor }}>{icon}</span>
        </div>
        <div
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-semibold`}
          style={{
            background: isPositive ? "rgba(52,211,153,0.12)" : "rgba(239,68,68,0.12)",
            color: isPositive ? "#34d399" : "#f87171",
          }}
        >
          {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
          {isPositive ? "+" : ""}{growth}%
        </div>
      </div>

      {/* Value */}
      <div className="mb-1">
        <p className="text-2xl font-bold text-white tracking-tight">
          {prefix}{typeof value === "number" ? value.toLocaleString() : value}{suffix}
        </p>
      </div>
      <p className="text-xs text-slate-500 font-medium mb-4">{title}</p>

      {/* Sparkline */}
      <SparklineChart data={trend} color={c.line} />
    </div>
  );
}
