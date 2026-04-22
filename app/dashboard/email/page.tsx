"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { SubscriberGrowthChart } from "@/components/Charts/SubscriberGrowthChart";
import { Mail, TrendingUp, UserPlus, Activity, RefreshCw } from "lucide-react";

const glassCard = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const sourceColors: Record<string, string> = {
  "Newsletter Form": "#818cf8",
  "Presale Page": "#818cf8",
  "Twitter Campaign": "#22d3ee",
  "Telegram Bot": "#a78bfa",
  "Google Ads": "#34d399",
  "Direct": "#f472b6",
  "Referral": "#fbbf24",
};

function colorFor(source: string) {
  return sourceColors[source] ?? "#94a3b8";
}

interface Subscriber {
  email: string;
  source: string;
  subscribedAt: string;
  status: string;
}

interface SubscriberData {
  total: number;
  list: Subscriber[];
  growthChart: { month: string; count: number }[];
  bySource: Record<string, number>;
}

export default function EmailSubscribersPage() {
  const [data, setData] = useState<SubscriberData | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch('/api/subscribers');
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const total = data?.total ?? 0;
  const list = data?.list ?? [];
  const growthChart = data?.growthChart ?? [];
  const bySource = data?.bySource ?? {};

  const thisWeek = list.filter((s) => {
    const d = new Date(s.subscribedAt);
    return Date.now() - d.getTime() < 7 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div>
      <TopBar title="Email Subscribers" subtitle="Real subscribers from your newsletter form" />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Subscribers", value: loading ? "…" : total.toLocaleString(), icon: <Mail size={15} />, color: "#f472b6" },
            { label: "New This Week", value: loading ? "…" : thisWeek.toString(), icon: <UserPlus size={15} />, color: "#818cf8" },
            { label: "Sources", value: loading ? "…" : Object.keys(bySource).length.toString(), icon: <TrendingUp size={15} />, color: "#34d399" },
            { label: "Status", value: "Active", icon: <Activity size={15} />, color: "#22d3ee" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5" style={glassCard}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Growth chart */}
        {growthChart.length > 0 && (
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-1">Subscriber Growth</h3>
            <p className="text-xs text-slate-500 mb-5">Cumulative subscribers over time</p>
            <SubscriberGrowthChart data={growthChart} />
          </div>
        )}

        {/* Subscriber table */}
        <div className="rounded-2xl p-6" style={glassCard}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Recent Subscribers</h3>
              <p className="text-xs text-slate-500 mt-0.5">Real sign-ups from sportstech.io</p>
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
              style={{ border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {total === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm gap-2">
              <Mail size={20} />
              <p>No subscribers yet.</p>
              <p className="text-xs text-slate-600">
                Wire your newsletter form on sportstech.io to POST to{" "}
                <code className="font-mono text-indigo-400">/api/subscribe</code>
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Email", "Source", "Date", "Status"].map((h) => (
                      <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((sub) => {
                    const color = colorFor(sub.source);
                    return (
                      <tr key={sub.email} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                        <td className="py-3.5 pr-6">
                          <span className="text-slate-200 font-mono text-xs">{sub.email}</span>
                        </td>
                        <td className="py-3.5 pr-6">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: `${color}18`, color }}>
                            {sub.source}
                          </span>
                        </td>
                        <td className="py-3.5 pr-6">
                          <span className="text-slate-400 text-xs">
                            {new Date(sub.subscribedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                            style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>
                            Active
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Source breakdown */}
        {Object.keys(bySource).length > 0 && (
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-5">Subscribers by Source</h3>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(bySource).map(([source, count]) => {
                const color = colorFor(source);
                return (
                  <div key={source} className="px-4 py-3 rounded-xl flex items-center gap-3"
                    style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <div>
                      <p className="text-xs text-slate-400">{source}</p>
                      <p className="text-sm font-bold text-white">{count} subscribers</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
