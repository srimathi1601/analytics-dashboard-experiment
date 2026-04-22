"use client";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

interface SubscriberGrowthChartProps {
  data: Array<{ month: string; count: number }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="px-3 py-2 rounded-xl text-xs" style={{ background: "rgba(9,11,23,0.95)", border: "1px solid rgba(255,255,255,0.1)" }}>
        <p className="text-slate-400 mb-1">{label}</p>
        <p className="text-white font-semibold">{payload[0].value.toLocaleString()} subscribers</p>
      </div>
    );
  }
  return null;
};

export function SubscriberGrowthChart({ data }: SubscriberGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="gradSubscribers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f472b6" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#f472b6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="month" tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: "#64748b", fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="count" stroke="#f472b6" strokeWidth={2} fill="url(#gradSubscribers)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
