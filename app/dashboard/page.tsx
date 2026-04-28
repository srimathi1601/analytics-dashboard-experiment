"use client";

import { useState, useEffect, useCallback } from "react";
import MetricCard from "@/components/MetricCard";
import TopBar from "@/components/TopBar";
import { TrafficLineChart } from "@/components/Charts/TrafficLineChart";
import { TrafficSourcesChart } from "@/components/Charts/TrafficSourcesChart";
import DateRangePicker, {
  DateRange,
  DATE_RANGE_OPTIONS,
} from "@/components/DateRangePicker";
import {
  Users,
  Activity,
  Target,
  Zap,
  MousePointerClick,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Globe,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────

interface MetricValue {
  value: number;
  growth: number;
}

interface OverviewData {
  totalUsers: MetricValue;
  newUsers: MetricValue;
  sessions: MetricValue;
  engagementRate: MetricValue;
  eventCount: MetricValue;
  conversions: MetricValue;
  bounceRate: { value: number };
  avgSessionDuration: { value: string; raw: number };
}

interface TrafficItem {
  date: string;
  pageviews: number;
  sessions: number;
  bounceRate: number;
  activeUsers: number;
}

interface CountryItem {
  country: string;
  countryCode: string;
  pct: number;
  sessions: number;
}

interface SourceItem {
  channel: string;
  sessions: number;
  users: number;
  pct: number;
  color: string;
}

interface RealtimeEvent {
  event_name: string;
  count: number;
  source: string;
  is_custom: boolean;
}

interface RealtimeData {
  events: RealtimeEvent[];
  activeUsers: number;
  fetchedAt: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const FLAG: Record<string, string> = {
  US: "🇺🇸", DE: "🇩🇪", GB: "🇬🇧", CA: "🇨🇦", FR: "🇫🇷",
  AU: "🇦🇺", IN: "🇮🇳", JP: "🇯🇵", BR: "🇧🇷", NL: "🇳🇱",
  CH: "🇨🇭", AT: "🇦🇹", SG: "🇸🇬", KR: "🇰🇷", IT: "🇮🇹",
  ES: "🇪🇸", PL: "🇵🇱", SE: "🇸🇪", NO: "🇳🇴", DK: "🇩🇰",
};

const COUNTRY_COLORS = ["#818cf8", "#22d3ee", "#a78bfa", "#34d399", "#f472b6", "#fbbf24"];

const SKELETON = "rounded-lg bg-white/5 animate-pulse";

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  // Default to 28 days — matches GA4 Reports Snapshot default
  const [dateRange, setDateRange]   = useState<DateRange>("28d");
  const [overview, setOverview]     = useState<OverviewData | null>(null);
  const [traffic, setTraffic]       = useState<TrafficItem[]>([]);
  const [countries, setCountries]   = useState<CountryItem[]>([]);
  const [sources, setSources]       = useState<SourceItem[]>([]);
  const [realtime, setRealtime]     = useState<RealtimeData | null>(null);
  const [isLoading, setIsLoading]   = useState(true);
  const [lastFetched, setLastFetched] = useState("");

  const config     = DATE_RANGE_OPTIONS.find((o) => o.value === dateRange)!;
  const isRealtime = config.isRealtime;
  const days       = config.days;

  // ── Fetch realtime ──────────────────────────────────────────────────────────
  const fetchRealtime = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/analytics/realtime");
      if (res.ok) setRealtime(await res.json());
      setLastFetched(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Fetch historical ────────────────────────────────────────────────────────
  const fetchHistorical = useCallback(async (d: number) => {
    setIsLoading(true);
    try {
      const [ovRes, trRes, coRes, soRes] = await Promise.allSettled([
        fetch(`/api/analytics/overview?days=${d}`),
        fetch(`/api/analytics/traffic?days=${d}`),
        fetch(`/api/analytics/countries?days=${d}`),
        fetch(`/api/analytics/sources?days=${d}`),
      ]);

      if (ovRes.status === "fulfilled" && ovRes.value.ok)
        setOverview(await ovRes.value.json());

      if (trRes.status === "fulfilled" && trRes.value.ok) {
        const data = await trRes.value.json();
        if (Array.isArray(data) && data.length > 0) setTraffic(data);
      }

      if (coRes.status === "fulfilled" && coRes.value.ok) {
        const data = await coRes.value.json();
        setCountries((data.countries ?? []).slice(0, 6) as CountryItem[]);
      }

      if (soRes.status === "fulfilled" && soRes.value.ok) {
        const data = await soRes.value.json();
        setSources(data.sources ?? []);
      }

      setLastFetched(new Date().toLocaleTimeString());
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── Effect: re-fetch on range change ────────────────────────────────────────
  useEffect(() => {
    if (isRealtime) {
      fetchRealtime();
      const id = setInterval(fetchRealtime, 30_000);
      return () => clearInterval(id);
    } else {
      fetchHistorical(days);
    }
  }, [dateRange, isRealtime, days, fetchRealtime, fetchHistorical]);

  // ── Derived ──────────────────────────────────────────────────────────────────
  const rangeLabel = config.label;
  const maxPct     = Math.max(...countries.map((c) => c.pct), 1);

  const metricCards = overview
    ? [
        { title: "Total Users",      value: overview.totalUsers.value,      growth: overview.totalUsers.growth,      icon: <Users size={16} />,             color: "indigo" as const },
        { title: "New Users",         value: overview.newUsers.value,         growth: overview.newUsers.growth,         icon: <TrendingUp size={16} />,        color: "cyan"   as const },
        { title: "Sessions",          value: overview.sessions.value,          growth: overview.sessions.growth,          icon: <Activity size={16} />,          color: "purple" as const },
        { title: "Engagement Rate",   value: overview.engagementRate.value,   growth: overview.engagementRate.growth,   icon: <Zap size={16} />,               color: "green"  as const, suffix: "%" },
        { title: "Events",            value: overview.eventCount.value,        growth: overview.eventCount.growth,        icon: <MousePointerClick size={16} />, color: "amber"  as const },
        { title: "Conversions",       value: overview.conversions.value,       growth: overview.conversions.growth,       icon: <Target size={16} />,            color: "pink"   as const },
      ]
    : [];

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div>
      <TopBar
        title="Dashboard Overview"
        subtitle={new Date().toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })}
      />

      <div className="p-6 space-y-6">

        {/* ── Header row: analytics label + date picker ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Analytics
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              Property: sportstech.io · ID 514836704
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastFetched && !isLoading && (
              <span className="text-[11px] text-slate-600 font-mono hidden sm:block">
                Updated {lastFetched}
              </span>
            )}
            <DateRangePicker value={dateRange} onChange={setDateRange} />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════ */}
        {/*  REALTIME MODE                                             */}
        {/* ══════════════════════════════════════════════════════════ */}
        {isRealtime && (
          <div className="space-y-4">
            {/* Active users hero */}
            <div
              className="rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center gap-6"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-28 h-28 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    border: "2px solid rgba(99,102,241,0.35)",
                  }}
                >
                  <span className="text-4xl font-bold text-white">
                    {isLoading ? "—" : (realtime?.activeUsers ?? 0)}
                  </span>
                </div>
                <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 animate-pulse border-2 border-[#030712]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-xs font-bold text-green-400 uppercase tracking-widest">
                    Live
                  </span>
                </div>
                <p className="text-2xl font-bold text-white">Active Users Right Now</p>
                <p className="text-sm text-slate-500 mt-1">
                  {rangeLabel} · auto-refreshes every 30 s
                </p>
                {realtime?.fetchedAt && (
                  <p className="text-xs text-slate-600 mt-0.5 font-mono">
                    Last fetch:{" "}
                    {new Date(realtime.fetchedAt).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>

            {/* Live events table */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-white">Live Events</h3>
                <span className="text-xs text-slate-500">{rangeLabel}</span>
              </div>

              {isLoading ? (
                <div className="space-y-2">
                  {Array(5).fill(0).map((_, i) => (
                    <div key={i} className={`h-9 ${SKELETON}`} />
                  ))}
                </div>
              ) : (realtime?.events ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No events detected in this window.</p>
              ) : (
                <div>
                  <div className="grid grid-cols-3 text-[10px] font-semibold text-slate-600 uppercase tracking-wider mb-2 px-1">
                    <span>Event</span>
                    <span>Source</span>
                    <span className="text-right">Count</span>
                  </div>
                  {(realtime?.events ?? []).slice(0, 10).map((ev, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-3 py-2.5 border-b border-white/5 last:border-0 items-center"
                    >
                      <span className="text-sm text-slate-300 font-mono truncate pr-2">
                        {ev.event_name}
                      </span>
                      <span className="text-xs text-slate-500 truncate pr-2">
                        {ev.source || "—"}
                      </span>
                      <span className="text-sm font-semibold text-white text-right">
                        {ev.count}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════ */}
        {/*  HISTORICAL MODE                                           */}
        {/* ══════════════════════════════════════════════════════════ */}
        {!isRealtime && (
          <>
            {/* ── Metric cards 2×3 grid ── */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoading
                ? Array(6).fill(0).map((_, i) => (
                    <MetricCard
                      key={i}
                      title=""
                      value={0}
                      growth={0}
                      trend={[]}
                      icon={<Users size={16} />}
                      color="indigo"
                      loading
                    />
                  ))
                : metricCards.map((card) => (
                    <MetricCard
                      key={card.title}
                      title={card.title}
                      value={card.value}
                      growth={card.growth}
                      trend={[]}
                      icon={card.icon}
                      color={card.color}
                      suffix={card.suffix ?? ""}
                    />
                  ))}
            </div>

            {/* ── Quick stats strip ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: "Avg Session Duration",
                  value: isLoading ? "—" : (overview?.avgSessionDuration.value ?? "—"),
                  icon: <Clock size={14} />,
                },
                {
                  label: "Bounce Rate",
                  value: isLoading ? "—" : `${overview?.bounceRate.value ?? "—"}%`,
                  icon: <ArrowUpRight size={14} />,
                },
                {
                  label: "Sessions",
                  value: isLoading ? "—" : (overview?.sessions.value.toLocaleString() ?? "—"),
                  icon: <Activity size={14} />,
                },
                {
                  label: "Date Range",
                  value: rangeLabel,
                  icon: <Globe size={14} />,
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: "1px solid rgba(255,255,255,0.06)",
                  }}
                >
                  <span className="text-slate-500 flex-shrink-0">{s.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-slate-500">{s.label}</p>
                    <p className="text-sm font-semibold text-white mt-0.5 truncate">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Traffic overview chart ── */}
            <div
              className="rounded-2xl p-6"
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-sm font-semibold text-white">Traffic Overview</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Pageviews &amp; sessions · {rangeLabel}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded-full inline-block bg-indigo-400" />
                    Pageviews
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-0.5 rounded-full inline-block bg-cyan-400" />
                    Sessions
                  </span>
                </div>
              </div>
              {isLoading ? (
                <div className={`h-[280px] w-full ${SKELETON}`} />
              ) : (
                <TrafficLineChart data={traffic} />
              )}
            </div>

            {/* ── Traffic sources + Countries ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Traffic sources */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Traffic Sources</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Sessions by channel · {rangeLabel}</p>
                  </div>
                </div>
                {isLoading ? (
                  <div className="space-y-2">
                    {Array(4).fill(0).map((_, i) => (
                      <div key={i} className={`h-7 ${SKELETON}`} />
                    ))}
                  </div>
                ) : sources.length > 0 ? (
                  <>
                    <TrafficSourcesChart data={sources} />
                    {/* Legend totals */}
                    <div className="mt-3 space-y-1">
                      {sources.slice(0, 5).map((s) => (
                        <div key={s.channel} className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1.5 text-slate-400">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ background: s.color }}
                            />
                            {s.channel}
                          </span>
                          <span className="text-slate-500 font-mono">
                            {s.sessions.toLocaleString()} ({s.pct}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">No data available.</p>
                )}
              </div>

              {/* Top countries */}
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Top Countries</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Sessions by country · {rangeLabel}</p>
                  </div>
                </div>
                {isLoading ? (
                  <div className="space-y-3">
                    {Array(5).fill(0).map((_, i) => (
                      <div key={i} className={`h-8 ${SKELETON}`} />
                    ))}
                  </div>
                ) : (
                  countries.map((c, i) => (
                    <div key={c.country} className="mb-4 last:mb-0">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-slate-300 flex items-center gap-1.5">
                          <span className="text-base leading-none">
                            {FLAG[c.countryCode] ?? "🌐"}
                          </span>
                          <span>{c.country}</span>
                        </span>
                        <span className="text-slate-500 font-mono">
                          {c.sessions.toLocaleString()} &nbsp;·&nbsp; {c.pct}%
                        </span>
                      </div>
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: "rgba(255,255,255,0.06)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(c.pct / maxPct) * 100}%`,
                            background: COUNTRY_COLORS[i % COUNTRY_COLORS.length],
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
