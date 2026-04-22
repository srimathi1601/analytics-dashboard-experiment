"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

interface AppInstallsChartProps {
  data: Array<{ week: string; ios: number; android: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(9,11,23,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
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

export function AppInstallsChart({ data }: AppInstallsChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="week" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Legend formatter={(v) => <span style={{ color: "#94a3b8", fontSize: 11 }}>{v}</span>} />
        <Bar dataKey="ios" name="iOS" fill="#818cf8" radius={[4, 4, 0, 0]} />
        <Bar dataKey="android" name="Android" fill="#34d399" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
