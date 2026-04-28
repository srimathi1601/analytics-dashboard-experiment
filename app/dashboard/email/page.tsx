"use client";

import { useState, useEffect } from "react";
import TopBar from "@/components/TopBar";
import { SubscriberGrowthChart } from "@/components/Charts/SubscriberGrowthChart";
import {
  Mail, TrendingUp, UserPlus, Activity,
  RefreshCw, Users, Eye, MapPin, Globe, Link2,
} from "lucide-react";

const glassCard = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const SOURCE_COLORS: Record<string, string> = {
  google:    "#34d399",
  direct:    "#818cf8",
  twitter:   "#22d3ee",
  facebook:  "#60a5fa",
  instagram: "#f472b6",
  referral:  "#fbbf24",
  organic:   "#a78bfa",
  youtube:   "#f87171",
};

function sourceColor(s: string) {
  return SOURCE_COLORS[s.toLowerCase()] ?? "#94a3b8";
}

function flagEmoji(code: string) {
  if (!code || code.length !== 2) return "🌐";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

interface SubscriptionData {
  totalSignups: number;
  thisWeek: number;
  totalUsers: number;
  activeUsers: number;
  pageViews: number;
  growthChart: { month: string; count: number }[];
  bySource: { source: string; signups: number; users: number }[];
  byCountry: { country: string; countryCode: string; signups: number; users: number; pct: number }[];
  byLocation: { location: string; signups: number; users: number }[];
  byStatus: { status: string; signups: number; users: number }[];
  trafficSources: {
    source: string;
    sessions: number;
    users: number;
    activeUsers: number;
    avgDuration: string;
    sessionsPerUser: number;
    engagementRate: number;
  }[];
}

interface EmailEntry {
  email: string;
  source: string;
  subscribedAt: string;
  status: string;
}

export default function EmailSubscribersPage() {
  const [data, setData] = useState<SubscriptionData | null>(null);
  const [emails, setEmails] = useState<EmailEntry[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchData() {
    setLoading(true);
    try {
      const [analyticsRes, subscribersRes] = await Promise.all([
        fetch("/api/analytics/subscriptions"),
        fetch("/api/subscribers"),
      ]);
      if (analyticsRes.ok) setData(await analyticsRes.json());
      if (subscribersRes.ok) {
        const sub = await subscribersRes.json();
        setEmails(sub.list ?? []);
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchData(); }, []);

  const d = data;
  const maxSourceSignups   = Math.max(...(d?.bySource.map((s) => s.signups) ?? [1]), 1);
  const maxLocationSignups = Math.max(...(d?.byLocation.map((l) => l.signups) ?? [1]), 1);

  return (
    <div>
      <TopBar
        title="Email Subscribers"
        subtitle="newsletter_signup · GA4 Analytics · Last 180 days"
      />

      <div className="p-6 space-y-6">

        {/* ── Summary cards ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Event Signups",   value: d?.totalSignups,  icon: <Mail size={15} />,      color: "#f472b6" },
            { label: "New This Week",   value: d?.thisWeek,      icon: <UserPlus size={15} />,  color: "#818cf8" },
            { label: "Total Users",     value: d?.totalUsers,    icon: <Users size={15} />,     color: "#34d399" },
            { label: "Active Users",    value: d?.activeUsers,   icon: <Activity size={15} />,  color: "#22d3ee" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5" style={glassCard}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {loading ? "…" : (s.value ?? 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Site Page Views",  value: d?.pageViews,                      icon: <Eye size={15} />,       color: "#fbbf24" },
            { label: "Signup Status",    value: "Active",                           icon: <Activity size={15} />,  color: "#34d399" },
            { label: "Sources Tracked",  value: d?.bySource.length,                icon: <TrendingUp size={15} />,color: "#818cf8" },
            { label: "Countries",        value: d?.byCountry.length,               icon: <Globe size={15} />,     color: "#f472b6" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5" style={glassCard}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="text-2xl font-bold text-white">
                {loading ? "…" : typeof s.value === "string" ? s.value : (s.value ?? 0).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* ── Growth chart ── */}
        {(d?.growthChart.length ?? 0) > 0 && (
          <div className="rounded-2xl p-6" style={glassCard}>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-sm font-semibold text-white">Subscriber Growth</h3>
              <button
                onClick={fetchData}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                style={{ border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Cumulative newsletter_signup events from GA4
            </p>
            <SubscriberGrowthChart data={d!.growthChart} />
          </div>
        )}

        {/* ── Email list (from subscribers.json) ── */}
        <div className="rounded-2xl p-6" style={glassCard}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Subscriber Email List</h3>
            </div>
            <span className="text-xs text-slate-500 font-mono">
              {loading ? "…" : `${emails.length} emails`}
            </span>
          </div>
          <p className="text-xs text-slate-500 mb-5">Collected via /api/subscribe · stored in subscribers.json</p>

          {emails.length === 0 && !loading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm gap-2">
              <Mail size={18} />
              <p>No emails collected yet.</p>
              <p className="text-xs text-slate-600">
                POST to <code className="font-mono text-indigo-400">/api/subscribe</code> from your sportstech.io form.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Email", "Source", "Subscribed", "Status"].map((h) => (
                      <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {emails.map((entry) => (
                    <tr key={entry.email} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 pr-6">
                        <span className="text-slate-200 font-mono text-xs">{entry.email}</span>
                      </td>
                      <td className="py-3.5 pr-6">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                          style={{ background: `${sourceColor(entry.source)}18`, color: sourceColor(entry.source) }}>
                          {entry.source}
                        </span>
                      </td>
                      <td className="py-3.5 pr-6">
                        <span className="text-slate-400 text-xs">
                          {new Date(entry.subscribedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                          style={{ background: "rgba(52,211,153,0.1)", color: "#34d399" }}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Country breakdown ── */}
        {(d?.byCountry.length ?? 0) > 0 && (
          <div className="rounded-2xl p-6" style={glassCard}>
            <div className="flex items-center gap-2 mb-1">
              <Globe size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Signups by Country</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Where subscribers are located when they signed up
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Country", "Signups", "Users", "Share"].map((h) => (
                      <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-6">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {d!.byCountry.map((row) => (
                    <tr key={row.country} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-6">
                        <div className="flex items-center gap-2">
                          <span className="text-lg leading-none">{flagEmoji(row.countryCode)}</span>
                          <span className="text-slate-200 text-xs">{row.country}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-6">
                        <span className="text-white font-bold text-xs">{row.signups.toLocaleString()}</span>
                      </td>
                      <td className="py-3 pr-6">
                        <span className="text-slate-400 text-xs">{row.users.toLocaleString()}</span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${row.pct}%`, background: "linear-gradient(90deg,#818cf8,#818cf888)" }}
                            />
                          </div>
                          <span className="text-xs text-slate-500">{row.pct}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Source + Signup Location ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Source breakdown */}
          {(d?.bySource.length ?? 0) > 0 && (
            <div className="rounded-2xl p-6" style={glassCard}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={14} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-white">Signups by Source</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5">Traffic source when newsletter_signup fired</p>
              <div className="space-y-3">
                {d!.bySource.map((s) => {
                  const color = sourceColor(s.source);
                  const pct = (s.signups / maxSourceSignups) * 100;
                  return (
                    <div key={s.source}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                          <span className="text-xs text-slate-300 capitalize">{s.source}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-white font-bold">{s.signups.toLocaleString()}</span>
                          <span className="text-slate-500">{s.users.toLocaleString()} users</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg,${color},${color}88)` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Signup location — customEvent:signup_location */}
          {(d?.byLocation.length ?? 0) > 0 && (
            <div className="rounded-2xl p-6" style={glassCard}>
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-slate-400" />
                <h3 className="text-sm font-semibold text-white">Signup Location</h3>
              </div>
              <p className="text-xs text-slate-500 mb-5">
                <code className="font-mono text-indigo-400">signup_location</code> custom parameter from GA4
              </p>
              <div className="space-y-3">
                {d!.byLocation.map((l) => {
                  const pct = (l.signups / maxLocationSignups) * 100;
                  return (
                    <div key={l.location}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <Link2 size={11} className="text-slate-500 flex-shrink-0" />
                          <span className="text-xs text-slate-300 font-mono capitalize truncate">
                            {l.location.replace(/_/g, " ")}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs ml-3 flex-shrink-0">
                          <span className="text-white font-bold">{l.signups.toLocaleString()}</span>
                          <span className="text-slate-500">{l.users.toLocaleString()} users</span>
                        </div>
                      </div>
                      <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, background: "linear-gradient(90deg,#22d3ee,#22d3ee88)" }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* ── Signup Status table — customEvent:signup_status ── */}
        {(d?.byStatus.length ?? 0) > 0 && (
          <div className="rounded-2xl p-6" style={glassCard}>
            <div className="flex items-center gap-2 mb-1">
              <Activity size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Signup Status</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              <code className="font-mono text-indigo-400">signup_status</code> custom parameter · GA4
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Status", "Event Count", "Total Users"].map((h) => (
                      <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {d!.byStatus.map((s) => {
                    const color = s.status.toLowerCase() === "success" ? "#34d399"
                      : s.status.toLowerCase() === "failed" ? "#f87171" : "#94a3b8";
                    return (
                      <tr key={s.status} className="border-b border-white/5 last:border-0">
                        <td className="py-3.5 pr-6">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                            <span className="text-xs font-semibold capitalize" style={{ color }}>{s.status}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-6">
                          <span className="text-white font-bold text-xs">{s.signups.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5">
                          <span className="text-slate-400 text-xs">{s.users.toLocaleString()}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Traffic Sources table ── */}
        {(d?.trafficSources.length ?? 0) > 0 && (
          <div className="rounded-2xl p-6" style={glassCard}>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp size={14} className="text-slate-400" />
              <h3 className="text-sm font-semibold text-white">Traffic Sources</h3>
            </div>
            <p className="text-xs text-slate-500 mb-5">All site traffic by source · last 30 days</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Source", "Sessions", "Users", "Active Users", "Avg Duration", "Sessions / User", "Engagement Rate"].map((h) => (
                      <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-5 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {d!.trafficSources.map((row) => {
                    const color = sourceColor(row.source);
                    return (
                      <tr key={row.source} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                        <td className="py-3.5 pr-5">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-slate-200 text-xs capitalize">{row.source}</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-5">
                          <span className="text-white font-bold text-xs">{row.sessions.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 pr-5">
                          <span className="text-slate-300 text-xs">{row.users.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 pr-5">
                          <span className="text-slate-300 text-xs">{row.activeUsers.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 pr-5">
                          <span className="text-slate-400 text-xs font-mono">{row.avgDuration}</span>
                        </td>
                        <td className="py-3.5 pr-5">
                          <span className="text-slate-400 text-xs">{row.sessionsPerUser}</span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div
                                className="h-full rounded-full"
                                style={{ width: `${Math.min(row.engagementRate, 100)}%`, background: color }}
                              />
                            </div>
                            <span className="text-xs text-slate-400">{row.engagementRate}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {!loading && (d?.totalSignups ?? 0) === 0 && (
          <div
            className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm gap-2 rounded-2xl"
            style={glassCard}
          >
            <Mail size={20} />
            <p>No newsletter_signup events found in the last 180 days.</p>
            <p className="text-xs text-slate-600">
              Make sure the <code className="font-mono text-indigo-400">newsletter_signup</code> event is firing in GA4.
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
