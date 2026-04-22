"use client";

import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface RetentionChartProps {
  data: Array<{ day: string; retention: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(9,11,23,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-white font-semibold">{payload[0].value}% retained</p>
      </div>
    );
  }
  return null;
};

export function RetentionChart({ data }: RetentionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="retention" stroke="#34d399" strokeWidth={2.5} dot={{ fill: "#34d399", r: 4, strokeWidth: 0 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
