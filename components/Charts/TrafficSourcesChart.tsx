"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Source {
  channel: string;
  sessions: number;
  users: number;
  pct: number;
  color: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.[0]) return null;
  const d: Source = payload[0].payload;
  return (
    <div
      className="px-3 py-2 rounded-xl text-xs"
      style={{
        background: "rgba(9,11,23,0.97)",
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(12px)",
      }}
    >
      <p className="text-slate-300 font-semibold mb-1">{d.channel}</p>
      <div className="flex flex-col gap-0.5">
        <span className="text-slate-400">
          Sessions: <span className="text-white font-semibold">{d.sessions.toLocaleString()}</span>
        </span>
        <span className="text-slate-400">
          Users: <span className="text-white font-semibold">{d.users.toLocaleString()}</span>
        </span>
        <span className="text-slate-400">
          Share: <span className="text-white font-semibold">{d.pct}%</span>
        </span>
      </div>
    </div>
  );
};

export function TrafficSourcesChart({ data }: { data: Source[] }) {
  return (
    <ResponsiveContainer width="100%" height={Math.max(160, data.length * 36)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ left: 0, right: 16, top: 4, bottom: 4 }}
      >
        <XAxis
          type="number"
          tick={{ fill: "#475569", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => v.toLocaleString()}
        />
        <YAxis
          type="category"
          dataKey="channel"
          tick={{ fill: "#94a3b8", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={110}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Bar dataKey="sessions" radius={[0, 4, 4, 0]} maxBarSize={20}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.color} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
