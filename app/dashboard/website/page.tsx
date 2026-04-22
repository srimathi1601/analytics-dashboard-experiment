"use client";

import { useState, useEffect } from "react";
import { trafficData as mockTraffic, topPages as mockTopPages, deviceData, countryData as mockCountries } from "@/lib/mockData";
import TopBar from "@/components/TopBar";
import { TrafficLineChart } from "@/components/Charts/TrafficLineChart";
import { TopPagesBarChart } from "@/components/Charts/TopPagesBarChart";
import { DevicePieChart } from "@/components/Charts/DevicePieChart";
import { Globe, Eye, Clock, TrendingDown } from "lucide-react";

type TrafficItem = { date: string; pageviews: number; sessions: number; bounceRate: number };
type PageItem = { page: string; views: number };
type CountryItem = { country: string; sessions: number; pct: number };

const glassCard = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
};

export default function WebsiteAnalyticsPage() {
  const [traffic, setTraffic] = useState<TrafficItem[]>(mockTraffic);
  const [topPages, setTopPages] = useState<PageItem[]>(mockTopPages);
  const [countries, setCountries] = useState<CountryItem[]>(mockCountries);
  const [summary, setSummary] = useState({
    totalSessions: "19,940",
    avgDuration: "3m 12s",
  });

  useEffect(() => {
    async function fetchAll() {
      const [trafficRes, pagesRes, countriesRes] = await Promise.allSettled([
        fetch("/api/analytics/traffic"),
        fetch("/api/analytics/pages"),
        fetch("/api/analytics/countries"),
      ]);

      if (trafficRes.status === "fulfilled" && trafficRes.value.ok) {
        const data: TrafficItem[] = await trafficRes.value.json();
        if (Array.isArray(data) && data.length > 0) setTraffic(data);
      }

      if (pagesRes.status === "fulfilled" && pagesRes.value.ok) {
        const data = await pagesRes.value.json();
        if (Array.isArray(data) && data.length > 0) {
          setTopPages(data.slice(0, 5).map((p: any) => ({ page: p.page, views: p.views })));
        }
      }

      if (countriesRes.status === "fulfilled" && countriesRes.value.ok) {
        const data = await countriesRes.value.json();
        const list: CountryItem[] = (data.countries ?? []).slice(0, 6);
        if (list.length > 0) {
          setCountries(list);
          setSummary((prev) => ({
            ...prev,
            totalSessions: data.totalSessions?.toLocaleString() ?? prev.totalSessions,
          }));
        }
      }
    }

    fetchAll();
  }, []);

  const totalPageviews = traffic.reduce((s, d) => s + d.pageviews, 0);
  const avgBounce = (traffic.reduce((s, d) => s + d.bounceRate, 0) / (traffic.length || 1)).toFixed(1);

  return (
    <div>
      <TopBar
        title="Website Analytics"
        subtitle="Traffic, pages, devices & geography"
      />

      <div className="p-6 space-y-6">
        {/* Summary row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Pageviews", value: totalPageviews.toLocaleString(), icon: <Eye size={15} />, color: "#818cf8" },
            { label: "Total Sessions", value: summary.totalSessions, icon: <Globe size={15} />, color: "#22d3ee" },
            { label: "Avg. Bounce Rate", value: `${avgBounce}%`, icon: <TrendingDown size={15} />, color: "#f472b6" },
            { label: "Avg. Duration", value: summary.avgDuration, icon: <Clock size={15} />, color: "#34d399" },
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

        {/* Traffic line chart */}
        <div className="rounded-2xl p-6" style={glassCard}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">Traffic — Last 7 Days</h3>
              <p className="text-xs text-slate-500 mt-0.5">Pageviews vs Sessions</p>
            </div>
            <div className="flex items-center gap-4 text-xs text-slate-500">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 inline-block bg-indigo-400 rounded-full" />Pageviews</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-0.5 inline-block bg-cyan-400 rounded-full" />Sessions</span>
            </div>
          </div>
          <TrafficLineChart data={traffic} />
        </div>

        {/* Two column: bar chart + pie chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-1">Top Pages</h3>
            <p className="text-xs text-slate-500 mb-5">By total pageviews</p>
            <TopPagesBarChart data={topPages} />
          </div>

          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-1">Device Breakdown</h3>
            <p className="text-xs text-slate-500 mb-5">Traffic by device type</p>
            <DevicePieChart data={deviceData} />
          </div>
        </div>

        {/* Country table */}
        <div className="rounded-2xl p-6" style={glassCard}>
          <h3 className="text-sm font-semibold text-white mb-1">Traffic by Country</h3>
          <p className="text-xs text-slate-500 mb-5">Top countries by sessions</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Country", "Sessions", "Share", "Trend"].map((h) => (
                    <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-6">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {countries.map((row, i) => (
                  <tr key={row.country} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 w-4">{i + 1}</span>
                        <span className="text-slate-200">{row.country}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-6 text-white font-semibold">{row.sessions.toLocaleString()}</td>
                    <td className="py-3 pr-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 rounded-full max-w-[100px]" style={{ background: "rgba(255,255,255,0.06)" }}>
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min(row.pct / 30 * 100, 100)}%` }} />
                        </div>
                        <span className="text-slate-400 text-xs">{row.pct}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                        ↑ Live
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
