"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface TrafficLineChartProps {
  data: Array<{ date: string; pageviews: number; sessions: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs"
        style={{
          background: "rgba(9,11,23,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(12px)",
        }}
      >
        <p className="text-slate-400 mb-1.5 font-medium">{label}</p>
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.color }} />
            <span className="text-slate-300">{entry.name}:</span>
            <span className="text-white font-semibold">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function TrafficLineChart({ data }: TrafficLineChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradPageviews" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#818cf8" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#818cf8" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradSessions" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.3} />
            <stop offset="100%" stopColor="#22d3ee" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="date" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="pageviews" name="Pageviews" stroke="#818cf8" strokeWidth={2} fill="url(#gradPageviews)" dot={false} />
        <Area type="monotone" dataKey="sessions" name="Sessions" stroke="#22d3ee" strokeWidth={2} fill="url(#gradSessions)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
