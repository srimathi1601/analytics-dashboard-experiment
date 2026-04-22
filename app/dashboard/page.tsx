"use client";

import { useState, useEffect } from "react";
import { overviewStats as mockStats, trafficData as mockTraffic } from "@/lib/mockData";
import MetricCard from "@/components/MetricCard";
import TopBar from "@/components/TopBar";
import { TrafficLineChart } from "@/components/Charts/TrafficLineChart";
import {
  Users,
  Activity,
  Target,
  DollarSign,
  Mail,
  Zap,
  ArrowUpRight,
  Clock,
} from "lucide-react";

type Stats = typeof mockStats;
type TrafficItem = { date: string; pageviews: number; sessions: number; bounceRate: number };
type CountryItem = { country: string; pct: number; sessions: number };

const cards = [
  { title: "Total Users", key: "totalUsers" as const, icon: <Users size={16} />, color: "indigo" as const, prefix: "", suffix: "" },
  { title: "Sessions", key: "sessions" as const, icon: <Activity size={16} />, color: "cyan" as const, prefix: "", suffix: "" },
  { title: "Conversions", key: "conversions" as const, icon: <Target size={16} />, color: "purple" as const, prefix: "", suffix: "" },
  { title: "Revenue", key: "revenue" as const, icon: <DollarSign size={16} />, color: "green" as const, prefix: "$", suffix: "" },
  { title: "Email Subscribers", key: "emailSubscribers" as const, icon: <Mail size={16} />, color: "pink" as const, prefix: "", suffix: "" },
  { title: "Active Users", key: "activeUsers" as const, icon: <Zap size={16} />, color: "amber" as const, prefix: "", suffix: "" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>(mockStats);
  const [traffic, setTraffic] = useState<TrafficItem[]>(mockTraffic);
  const [countries, setCountries] = useState<CountryItem[]>([
    { country: "United States", pct: 29.1, sessions: 8420 },
    { country: "United Kingdom", pct: 14.3, sessions: 4130 },
    { country: "Germany", pct: 9.9, sessions: 2870 },
    { country: "Canada", pct: 8.1, sessions: 2340 },
  ]);
  const [lastFetched, setLastFetched] = useState<string>("Loading…");
  const [quickStats, setQuickStats] = useState({
    avgDuration: "—",
    bounceRate: "—",
  });

  useEffect(() => {
    async function fetchAll() {
      const [overviewRes, trafficRes, countriesRes] = await Promise.allSettled([
        fetch("/api/analytics/overview"),
        fetch("/api/analytics/traffic"),
        fetch("/api/analytics/countries"),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value.ok) {
        const data = await overviewRes.value.json();
        setStats((prev) => ({
          ...prev,
          totalUsers: { value: data.totalUsers.value, growth: data.totalUsers.growth, trend: [] },
          sessions: { value: data.sessions.value, growth: data.sessions.growth, trend: [] },
          conversions: { value: data.conversions.value, growth: data.conversions.growth, trend: [] },
          activeUsers: { value: data.activeUsers.value, growth: data.activeUsers.growth, trend: [] },
        }));
        setQuickStats({
          avgDuration: data.avgSessionDuration?.value ?? "—",
          bounceRate: data.bounceRate?.value != null ? `${data.bounceRate.value}%` : "—",
        });
        setLastFetched(new Date().toLocaleTimeString());
      }

      if (trafficRes.status === "fulfilled" && trafficRes.value.ok) {
        const data = await trafficRes.value.json();
        if (Array.isArray(data) && data.length > 0) setTraffic(data);
      }

      if (countriesRes.status === "fulfilled" && countriesRes.value.ok) {
        const data = await countriesRes.value.json();
        const top4 = (data.countries ?? []).slice(0, 4) as CountryItem[];
        if (top4.length > 0) setCountries(top4);
      }
    }

    fetchAll();
  }, []);

  const countryColors = ["#818cf8", "#22d3ee", "#a78bfa", "#34d399"];
  const maxPct = Math.max(...countries.map((c) => c.pct), 1);

  return (
    <div>
      <TopBar
        title="Dashboard Overview"
        subtitle={`${new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })} — Real-time analytics`}
      />

      <div className="p-6 space-y-6">
        {/* Metric Cards Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
              Key Metrics
            </h2>
            <span className="text-[11px] text-slate-600 font-mono">
              {lastFetched !== "Loading…" ? `Updated at ${lastFetched}` : lastFetched}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => {
              const stat = stats[card.key];
              return (
                <MetricCard
                  key={card.key}
                  title={card.title}
                  value={stat.value}
                  growth={stat.growth}
                  trend={stat.trend}
                  icon={card.icon}
                  color={card.color}
                  prefix={card.prefix}
                  suffix={card.suffix}
                />
              );
            })}
          </div>
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: "Avg. Session Duration", value: quickStats.avgDuration, icon: <Clock size={14} /> },
            { label: "Bounce Rate", value: quickStats.bounceRate, icon: <ArrowUpRight size={14} /> },
            { label: "Pages / Session", value: "4.2", icon: <Activity size={14} /> },
            { label: "New vs Returning", value: "68/32", icon: <Users size={14} /> },
          ].map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 px-4 py-3 rounded-xl"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <span className="text-slate-500">{s.icon}</span>
              <div>
                <p className="text-xs text-slate-500">{s.label}</p>
                <p className="text-sm font-semibold text-white mt-0.5">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Traffic chart */}
        <div
          className="rounded-2xl p-6"
          style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Traffic Overview</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pageviews & sessions — last 7 days</p>
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
          <TrafficLineChart data={traffic} />
        </div>

        {/* Bottom section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Top Events Today</h3>
            {[
              { name: "cta_clicked", count: "7,634", color: "#818cf8" },
              { name: "wallet_connected", count: "4,821", color: "#22d3ee" },
              { name: "presale_clicked", count: "3,290", color: "#a78bfa" },
              { name: "token_purchase", count: "1,847", color: "#34d399" },
            ].map((event) => (
              <div key={event.name} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: event.color }} />
                  <span className="text-sm text-slate-300 font-mono">{event.name}</span>
                </div>
                <span className="text-sm font-semibold text-white">{event.count}</span>
              </div>
            ))}
          </div>

          <div
            className="rounded-2xl p-6"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <h3 className="text-sm font-semibold text-white mb-4">Top Countries</h3>
            {countries.map((c, i) => (
              <div key={c.country} className="mb-3 last:mb-0">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-300">{c.country}</span>
                  <span className="text-slate-400">{c.pct}%</span>
                </div>
                <div className="h-1 rounded-full" style={{ background: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${(c.pct / maxPct) * 100}%`, background: countryColors[i % countryColors.length] }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
