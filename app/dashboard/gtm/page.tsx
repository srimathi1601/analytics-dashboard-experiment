"use client";

import { useEffect, useState, useCallback } from "react";
import TopBar from "@/components/TopBar";
import { Tag, TrendingUp, Zap, Clock, Users, RefreshCw, AlertCircle, History } from "lucide-react";

const glassCard = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const EVENT_COLORS: Record<string, string> = {
  buy_now_click:       "#34d399",
  whitepaper_click:    "#60a5fa",
  presale_join_click:  "#818cf8",
  newsletter_subscribe:"#f472b6",
  social_icon_click:   "#22d3ee",
  footer_click:        "#a78bfa",
  powered_by_click:    "#fbbf24",
};

function colorFor(name: string) {
  return EVENT_COLORS[name] ?? "#94a3b8";
}

// GA4 auto-collected events — everything else shown as custom
const AUTO_EVENTS = new Set([
  "page_view", "session_start", "first_visit", "user_engagement",
  "scroll", "click", "file_download", "form_start", "form_submit",
  "video_start", "video_progress", "video_complete",
]);

interface RealtimeEvent {
  event_name: string;
  count: number;
  last_triggered: string;
  source: string;
  is_custom: boolean;
}

interface RealtimeData {
  events: RealtimeEvent[];
  activeUsers: number;
  fetchedAt: string;
  error?: string;
}

interface HistoricalEvent {
  event_name: string;
  count: number;
  per_user: number;
  users_triggered: number;
  source: string;
}

const REFRESH_MS = 30_000;

export default function GTMEventsPage() {
  const [data,       setData]       = useState<RealtimeData | null>(null);
  const [history,    setHistory]    = useState<HistoricalEvent[]>([]);
  const [histLoading,setHistLoading]= useState(true);
  const [loading,    setLoading]    = useState(true);
  const [lastRefresh,setLastRefresh]= useState<Date | null>(null);
  const [countdown,  setCountdown]  = useState(REFRESH_MS / 1000);

  const fetchRealtime = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analytics/realtime");
      const json: RealtimeData = await res.json();
      setData(json);
      setLastRefresh(new Date());
      setCountdown(REFRESH_MS / 1000);
    } catch {
      setData({ events: [], activeUsers: 0, fetchedAt: "", error: "Failed to fetch" });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    setHistLoading(true);
    try {
      const res = await fetch("/api/analytics/events");
      const json: HistoricalEvent[] = await res.json();
      if (Array.isArray(json)) setHistory(json);
    } catch {
      setHistory([]);
    } finally {
      setHistLoading(false);
    }
  }, []);

  useEffect(() => { fetchRealtime(); fetchHistory(); }, [fetchRealtime, fetchHistory]);

  useEffect(() => {
    const interval = setInterval(fetchRealtime, REFRESH_MS);
    return () => clearInterval(interval);
  }, [fetchRealtime]);

  useEffect(() => {
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(tick);
  }, [lastRefresh]);

  const events      = data?.events ?? [];
  const customEvents = events.filter((e) => e.is_custom);
  const totalCount  = events.reduce((s, e) => s + e.count, 0);
  const topEvent    = [...events].sort((a, b) => b.count - a.count)[0];

  // Separate custom vs auto in 30-day history
  const histCustom = history.filter((e) => !AUTO_EVENTS.has(e.event_name));
  const histAuto   = history.filter((e) => AUTO_EVENTS.has(e.event_name));
  const histTotal  = history.reduce((s, e) => s + e.count, 0);

  return (
    <div>
      <TopBar title="GTM Events — Live" subtitle="GTM-P6JM5VS2 · sportstech.io · Realtime (last 30 min)" />

      <div className="p-6 space-y-6">

        {/* Error banner */}
        {data?.error && (
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm"
            style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", color: "#f87171" }}>
            <AlertCircle size={15} />
            <span>{data.error} — check <code className="font-mono text-xs">GA_PROPERTY_ID</code> and service account in <code className="font-mono text-xs">.env.local</code></span>
          </div>
        )}

        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Active Users (now)", value: data?.activeUsers?.toString() ?? "—",                 icon: <Users size={15} />,     color: "#34d399" },
            { label: "Events (30 min)",    value: totalCount.toLocaleString(),                          icon: <Zap size={15} />,       color: "#818cf8" },
            { label: "Custom Events (30d)",value: histCustom.length.toString(),                         icon: <Tag size={15} />,       color: "#22d3ee" },
            { label: "Top Event (live)",   value: topEvent?.event_name.replace(/_/g, " ") ?? "—",       icon: <TrendingUp size={15} />,color: "#f472b6" },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-5" style={glassCard}>
              <div className="flex items-center gap-2 mb-3">
                <span style={{ color: s.color }}>{s.icon}</span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
              <p className="text-xl font-bold text-white truncate">{loading && s.label !== "Custom Events (30d)" ? "…" : s.value}</p>
            </div>
          ))}
        </div>

        {/* Sportstech button events highlight (realtime) */}
        {customEvents.length > 0 && (
          <div className="rounded-2xl p-6" style={glassCard}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-semibold text-white">Sportstech.io Button Clicks — Live</h3>
                <p className="text-xs text-slate-500 mt-0.5">Last 30 min · BUY NOW · WHITEPAPER · JOIN PRESALE · NEWSLETTER · SOCIALS</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {customEvents.map((e) => {
                const color = colorFor(e.event_name);
                return (
                  <div key={e.event_name} className="rounded-xl p-4"
                    style={{ background: `${color}10`, border: `1px solid ${color}25` }}>
                    <p className="text-[11px] font-mono truncate mb-2" style={{ color }}>{e.event_name}</p>
                    <p className="text-2xl font-bold text-white">{e.count.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-500 mt-1">{e.last_triggered}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── 30-Day All Custom Events ─────────────────────────────────── */}
        <div className="rounded-2xl p-6" style={glassCard}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <History size={14} className="text-indigo-400" />
                All Custom Events — Last 30 Days
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Every event you created in GA4 / GTM · includes manually added triggers
              </p>
            </div>
            <button
              onClick={fetchHistory}
              disabled={histLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-opacity disabled:opacity-40"
              style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
            >
              <RefreshCw size={11} className={histLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          {histLoading ? (
            <div className="flex items-center justify-center py-10 text-slate-500 text-sm gap-2">
              <RefreshCw size={14} className="animate-spin" /> Fetching from GA4…
            </div>
          ) : histCustom.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 text-sm gap-2">
              <Tag size={20} />
              <p>No custom events in the last 30 days.</p>
              <p className="text-xs text-slate-600">Trigger an event on sportstech.io — it will appear here within ~24 hours.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Event Name", "Count (30d)", "Per User", "Users Triggered", "Source", "Share"].map((h) => (
                      <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {histCustom.map((event) => {
                    const color = colorFor(event.event_name);
                    const pct   = histTotal > 0 ? ((event.count / histTotal) * 100).toFixed(1) : "0.0";
                    return (
                      <tr key={event.event_name}
                        className="border-b border-white/5 last:border-0 transition-colors"
                        style={{ background: `${color}05` }}>
                        <td className="py-3.5 pr-5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-slate-200 font-mono text-xs">{event.event_name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide"
                              style={{ background: `${color}20`, color }}>custom</span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-5">
                          <span className="text-white font-bold">{event.count.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 pr-5">
                          <span className="text-slate-400 text-xs">{event.per_user.toFixed(2)}</span>
                        </td>
                        <td className="py-3.5 pr-5">
                          <span className="text-slate-300">{event.users_triggered.toLocaleString()}</span>
                        </td>
                        <td className="py-3.5 pr-5">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                            style={{ background: `${color}18`, color }}>
                            {event.source}
                          </span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                            </div>
                            <span className="text-xs text-slate-500">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* ── Auto-collected Events (30d) ───────────────────────────────── */}
        {histAuto.length > 0 && (
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-1">Auto-Collected Events — Last 30 Days</h3>
            <p className="text-xs text-slate-500 mb-5">GA4 built-in events (page_view, session_start, scroll, etc.)</p>
            <div className="space-y-2.5">
              {histAuto.map((event) => {
                const pct = histTotal > 0 ? (event.count / histTotal) * 100 : 0;
                return (
                  <div key={event.event_name} className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-400 w-44 truncate">{event.event_name}</span>
                    <div className="flex-1 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: "linear-gradient(90deg,#475569,#64748b)" }} />
                    </div>
                    <span className="text-xs text-slate-400 w-16 text-right font-mono">{event.count.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Realtime all events table ─────────────────────────────────── */}
        <div className="rounded-2xl p-6" style={glassCard}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">All Realtime Events</h3>
              <p className="text-xs text-slate-500 mt-0.5">Last 30 minutes · auto-refreshes every 30 s</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-500 font-mono">next refresh in {countdown}s</span>
              <button
                onClick={fetchRealtime}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-opacity disabled:opacity-40"
                style={{ background: "rgba(99,102,241,0.12)", color: "#818cf8", border: "1px solid rgba(99,102,241,0.2)" }}
              >
                <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium"
                style={{ background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            </div>
          </div>

          {loading && events.length === 0 ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-sm gap-2">
              <RefreshCw size={14} className="animate-spin" /> Fetching from GA4…
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-sm gap-2">
              <Clock size={20} />
              <p>No events in the last 30 minutes.</p>
              <p className="text-xs text-slate-600">Open sportstech.io/en and click BUY NOW to test.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    {["Event Name", "Count", "Last Seen", "Source", "Share"].map((h) => (
                      <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-6">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const pct   = totalCount > 0 ? ((event.count / totalCount) * 100).toFixed(1) : "0.0";
                    const color = colorFor(event.event_name);
                    return (
                      <tr key={event.event_name}
                        className="border-b border-white/5 last:border-0 transition-colors"
                        style={event.is_custom ? { background: `${color}06` } : {}}>
                        <td className="py-3.5 pr-6">
                          <div className="flex items-center gap-2.5">
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />
                            <span className="text-slate-200 font-mono text-xs">{event.event_name}</span>
                            {event.is_custom && (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wide"
                                style={{ background: `${color}20`, color }}>tracked</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3.5 pr-6"><span className="text-white font-bold">{event.count.toLocaleString()}</span></td>
                        <td className="py-3.5 pr-6"><span className="text-slate-400 text-xs">{event.last_triggered}</span></td>
                        <td className="py-3.5 pr-6">
                          <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
                            style={{ background: `${color}18`, color }}>{event.source}</span>
                        </td>
                        <td className="py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                            </div>
                            <span className="text-xs text-slate-500">{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {lastRefresh && (
            <p className="text-[10px] text-slate-600 font-mono mt-4" suppressHydrationWarning>
              Last fetched: {lastRefresh.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })} · GA4 Realtime API
            </p>
          )}
        </div>

        {/* Realtime event distribution */}
        {events.length > 0 && (
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-5">Live Event Distribution</h3>
            <div className="space-y-3">
              {events.slice(0, 12).map((event) => {
                const pct   = totalCount > 0 ? (event.count / totalCount) * 100 : 0;
                const color = colorFor(event.event_name);
                return (
                  <div key={event.event_name} className="flex items-center gap-4">
                    <span className="text-xs font-mono text-slate-400 w-48 truncate">{event.event_name}</span>
                    <div className="flex-1 h-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }} />
                    </div>
                    <span className="text-xs text-slate-400 w-16 text-right">{event.count.toLocaleString()}</span>
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
