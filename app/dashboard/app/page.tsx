"use client";

// API: GET /api/analytics/app
import { appAnalytics } from "@/lib/mockData";
import TopBar from "@/components/TopBar";
import { RetentionChart } from "@/components/Charts/RetentionChart";
import { AppInstallsChart } from "@/components/Charts/AppInstallsChart";
import { Smartphone, Users, TrendingUp, RefreshCw } from "lucide-react";

const glassCard = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
};

export default function AppAnalyticsPage() {
  return (
    <div>
      <TopBar title="App Analytics" subtitle="Installs, DAU & user retention" />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Installs",
              value: appAnalytics.installs.value.toLocaleString(),
              growth: appAnalytics.installs.growth,
              icon: <Smartphone size={15} />,
              color: "#818cf8",
            },
            {
              label: "Daily Active Users",
              value: appAnalytics.dau.value.toLocaleString(),
              growth: appAnalytics.dau.growth,
              icon: <Users size={15} />,
              color: "#22d3ee",
            },
            {
              label: "Day-30 Retention",
              value: "21%",
              growth: 2.4,
              icon: <RefreshCw size={15} />,
              color: "#34d399",
            },
            {
              label: "Install Growth",
              value: `+${appAnalytics.installs.growth}%`,
              growth: appAnalytics.installs.growth,
              icon: <TrendingUp size={15} />,
              color: "#fbbf24",
            },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5" style={glassCard}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: "#34d399" }}>↑ {s.growth}% vs last period</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-1">Weekly Installs</h3>
            <p className="text-xs text-slate-500 mb-5">iOS vs Android — 6 weeks</p>
            <AppInstallsChart data={appAnalytics.installsChart} />
          </div>

          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-1">User Retention Curve</h3>
            <p className="text-xs text-slate-500 mb-5">% of users retained over time</p>
            <RetentionChart data={appAnalytics.retentionChart} />
          </div>
        </div>

        {/* Retention breakdown table */}
        <div className="rounded-2xl p-6" style={glassCard}>
          <h3 className="text-sm font-semibold text-white mb-5">Retention Breakdown</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Cohort Day", "Retention %", "Visual", "Status"].map((h) => (
                    <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appAnalytics.retentionChart.map((row) => {
                  const getColor = (pct: number) => {
                    if (pct >= 60) return "#34d399";
                    if (pct >= 30) return "#fbbf24";
                    return "#f87171";
                  };
                  const color = getColor(row.retention);
                  const status = row.retention >= 60 ? "Excellent" : row.retention >= 30 ? "Average" : "At Risk";
                  return (
                    <tr key={row.day} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                      <td className="py-3.5 pr-6 text-slate-200 font-medium">{row.day}</td>
                      <td className="py-3.5 pr-6">
                        <span className="text-xl font-bold text-white">{row.retention}%</span>
                      </td>
                      <td className="py-3.5 pr-6">
                        <div className="w-32 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${row.retention}%`, background: color }}
                          />
                        </div>
                      </td>
                      <td className="py-3.5">
                        <span
                          className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                          style={{ background: `${color}18`, color }}
                        >
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform split */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {[
            { platform: "iOS", installs: 4930, share: 72, color: "#818cf8", icon: "🍎" },
            { platform: "Android", installs: 1910, share: 28, color: "#34d399", icon: "🤖" },
          ].map((p) => (
            <div
              key={p.platform}
              className="rounded-2xl p-6 flex items-center gap-6"
              style={{ background: `${p.color}0a`, border: `1px solid ${p.color}20` }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
                style={{ background: `${p.color}18` }}
              >
                {p.icon}
              </div>
              <div className="flex-1">
                <p className="text-xs text-slate-500 mb-1">{p.platform} Installs</p>
                <p className="text-2xl font-bold text-white">{p.installs.toLocaleString()}</p>
                <div className="mt-2 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div className="h-full rounded-full" style={{ width: `${p.share}%`, background: p.color }} />
                </div>
                <p className="text-xs mt-1.5" style={{ color: p.color }}>{p.share}% of total</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
