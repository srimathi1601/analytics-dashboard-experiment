"use client";

// API: GET /api/analytics/marketing
import { marketingData } from "@/lib/mockData";
import TopBar from "@/components/TopBar";
import { MarketingSourceChart } from "@/components/Charts/MarketingSourceChart";
import { TrendingUp, MousePointer, Target, DollarSign } from "lucide-react";

const glassCard = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
};

export default function MarketingAnalyticsPage() {
  const totalClicks = marketingData.campaigns.reduce((s, c) => s + c.clicks, 0);
  const totalConversions = marketingData.campaigns.reduce((s, c) => s + c.conversions, 0);
  const totalSpend = marketingData.campaigns.reduce((s, c) => s + c.spend, 0);
  const avgCTR = (marketingData.campaigns.reduce((s, c) => s + c.ctr, 0) / marketingData.campaigns.length).toFixed(1);

  return (
    <div>
      <TopBar title="Marketing Analytics" subtitle="Campaigns, sources & conversion by channel" />

      <div className="p-6 space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Clicks", value: totalClicks.toLocaleString(), icon: <MousePointer size={15} />, color: "#818cf8" },
            { label: "Conversions", value: totalConversions.toLocaleString(), icon: <Target size={15} />, color: "#34d399" },
            { label: "Avg. CTR", value: `${avgCTR}%`, icon: <TrendingUp size={15} />, color: "#22d3ee" },
            { label: "Total Spend", value: `$${totalSpend.toLocaleString()}`, icon: <DollarSign size={15} />, color: "#fbbf24" },
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

        {/* Source chart + conversion per channel */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-1">Traffic by Source</h3>
            <p className="text-xs text-slate-500 mb-5">Twitter, Telegram, Google, Direct</p>
            <MarketingSourceChart data={marketingData.sources} />
          </div>

          <div className="rounded-2xl p-6" style={glassCard}>
            <h3 className="text-sm font-semibold text-white mb-1">Conversion by Channel</h3>
            <p className="text-xs text-slate-500 mb-5">Conversions & rate per channel</p>
            <div className="space-y-4 mt-6">
              {marketingData.channelConversions.map((c, i) => {
                const colors = ["#818cf8", "#22d3ee", "#34d399", "#f472b6"];
                const color = colors[i % colors.length];
                const maxConv = Math.max(...marketingData.channelConversions.map((x) => x.conversions));
                return (
                  <div key={c.channel}>
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="text-slate-300 font-medium">{c.channel}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500">{c.conversions} conv.</span>
                        <span className="font-semibold" style={{ color }}>{c.rate}% rate</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${(c.conversions / maxConv) * 100}%`, background: color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* UTM Campaign Performance table */}
        <div className="rounded-2xl p-6" style={glassCard}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-semibold text-white">UTM Campaign Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">All active campaigns with metrics</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  {["Campaign", "Channel", "Clicks", "Conversions", "CTR", "Spend", "ROAS"].map((h) => (
                    <th key={h} className="text-left pb-3 text-xs font-medium text-slate-500 pr-5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {marketingData.campaigns.map((c) => {
                  const channelColors: Record<string, string> = {
                    Twitter: "#22d3ee", Google: "#34d399", Telegram: "#818cf8", Direct: "#f472b6",
                  };
                  const color = channelColors[c.channel] ?? "#818cf8";
                  const roas = ((c.conversions * 120) / c.spend).toFixed(1);
                  return (
                    <tr key={c.name} className="border-b border-white/5 last:border-0 hover:bg-white/3 transition-colors">
                      <td className="py-3.5 pr-5">
                        <span className="text-slate-200 font-medium">{c.name}</span>
                      </td>
                      <td className="py-3.5 pr-5">
                        <span className="px-2.5 py-1 rounded-lg text-[11px] font-medium" style={{ background: `${color}18`, color }}>
                          {c.channel}
                        </span>
                      </td>
                      <td className="py-3.5 pr-5 text-white font-semibold">{c.clicks.toLocaleString()}</td>
                      <td className="py-3.5 pr-5 text-white font-semibold">{c.conversions}</td>
                      <td className="py-3.5 pr-5">
                        <span className="text-emerald-400 font-semibold">{c.ctr}%</span>
                      </td>
                      <td className="py-3.5 pr-5 text-slate-300">${c.spend.toLocaleString()}</td>
                      <td className="py-3.5">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.12)", color: "#34d399" }}>
                          {roas}x
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
