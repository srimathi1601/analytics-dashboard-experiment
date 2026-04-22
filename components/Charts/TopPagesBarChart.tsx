"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";

interface TopPagesBarChartProps {
  data: Array<{ page: string; views: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="px-3 py-2 rounded-xl text-xs"
        style={{
          background: "rgba(9,11,23,0.95)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-white font-semibold">{payload[0].value.toLocaleString()} views</p>
      </div>
    );
  }
  return null;
};

const COLORS = ["#818cf8", "#6366f1", "#4f46e5", "#4338ca", "#3730a3"];

export function TopPagesBarChart({ data }: TopPagesBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
        <XAxis type="number" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="page" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
        <Tooltip content={<CustomTooltip />} />
        <Bar dataKey="views" radius={[0, 6, 6, 0]}>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
