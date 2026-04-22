"use client";

import TopBar from "@/components/TopBar";
import { Bell, Shield, Database, Globe, Key, Sliders } from "lucide-react";

const glassCard = {
  background: "rgba(255,255,255,0.02)",
  border: "1px solid rgba(255,255,255,0.06)",
};

const sections = [
  {
    icon: <Database size={16} />,
    title: "API Configuration",
    color: "#818cf8",
    fields: [
      { label: "Backend Base URL", value: "http://localhost:8080/api", type: "text" },
      { label: "API Key", value: "••••••••••••••••", type: "password" },
      { label: "Request Timeout (ms)", value: "5000", type: "number" },
    ],
    comment: "// TODO: Connect to Spring Boot backend — GET /api/*",
  },
  {
    icon: <Bell size={16} />,
    title: "Notifications",
    color: "#f472b6",
    fields: [
      { label: "Alert Email", value: "admin@nexor.io", type: "email" },
      { label: "Slack Webhook URL", value: "https://hooks.slack.com/...", type: "text" },
    ],
    comment: "// TODO: POST /api/settings/notifications",
  },
  {
    icon: <Shield size={16} />,
    title: "Security",
    color: "#34d399",
    fields: [
      { label: "Session Timeout (min)", value: "60", type: "number" },
      { label: "Allowed IP Range", value: "0.0.0.0/0", type: "text" },
    ],
    comment: "// TODO: PUT /api/settings/security",
  },
];

const toggles = [
  { label: "Enable real-time updates", checked: true, color: "#818cf8" },
  { label: "Dark mode", checked: true, color: "#22d3ee" },
  { label: "Email digest (weekly)", checked: false, color: "#f472b6" },
  { label: "GTM auto-tracking", checked: true, color: "#34d399" },
  { label: "Beta features", checked: false, color: "#fbbf24" },
];

export default function SettingsPage() {
  return (
    <div>
      <TopBar title="Settings" subtitle="Dashboard configuration & integrations" />

      <div className="p-6 space-y-6">
        {/* Config sections */}
        {sections.map((section) => (
          <div key={section.title} className="rounded-2xl p-6" style={glassCard}>
            <div className="flex items-center gap-3 mb-5">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${section.color}18` }}
              >
                <span style={{ color: section.color }}>{section.icon}</span>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">{section.title}</h3>
                <p className="text-[11px] font-mono text-slate-600 mt-0.5">{section.comment}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {section.fields.map((field) => (
                <div key={field.label}>
                  <label className="block text-xs text-slate-500 mb-1.5">{field.label}</label>
                  <input
                    type={field.type}
                    defaultValue={field.value}
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-slate-200 outline-none transition-all"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = section.color + "60";
                      e.target.style.background = "rgba(255,255,255,0.06)";
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = "rgba(255,255,255,0.08)";
                      e.target.style.background = "rgba(255,255,255,0.04)";
                    }}
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                className="px-4 py-2 rounded-xl text-xs font-medium transition-all hover:opacity-80"
                style={{ background: section.color, color: "#fff" }}
              >
                Save {section.title}
              </button>
            </div>
          </div>
        ))}

        {/* Toggles */}
        <div className="rounded-2xl p-6" style={glassCard}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(255,255,255,0.05)" }}>
              <Sliders size={16} className="text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-white">Feature Toggles</h3>
          </div>

          <div className="space-y-4">
            {toggles.map((t) => (
              <div key={t.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <span className="text-sm text-slate-300">{t.label}</span>
                <div
                  className="relative w-10 h-5 rounded-full cursor-pointer transition-all"
                  style={{ background: t.checked ? t.color : "rgba(255,255,255,0.08)" }}
                >
                  <div
                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: t.checked ? "calc(100% - 18px)" : "2px" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Java backend info */}
        <div
          className="rounded-2xl p-5"
          style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.2)" }}
        >
          <div className="flex items-start gap-3">
            <Key size={15} className="text-indigo-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-indigo-300 mb-1">Java Spring Boot Integration</p>
              <p className="text-xs text-slate-500 leading-relaxed font-mono">
                {`// Connect to your Spring Boot backend by setting the API base URL above.`}<br />
                {`// Endpoints: GET /api/analytics/overview | /website | /gtm-events | /marketing | /app`}<br />
                {`// Auth: GET /api/email/subscribers`}<br />
                {`// Database: PostgreSQL — see SQL schema in /lib/mockData.ts`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
