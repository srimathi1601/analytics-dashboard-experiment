"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown } from "lucide-react";

export type DateRange = "30min" | "1h" | "today" | "7d" | "28d" | "90d" | "365d";

export interface DateRangeConfig {
  value: DateRange;
  label: string;
  shortLabel: string;
  days: number;
  isRealtime: boolean;
}

// Labels and days match GA4 Reports Snapshot date presets exactly.
// Historical ranges use endDate='yesterday' in the API (completed days only).
export const DATE_RANGE_OPTIONS: DateRangeConfig[] = [
  { value: "30min", label: "Last 30 minutes", shortLabel: "30 min",  days: 0,   isRealtime: true  },
  { value: "1h",    label: "Last 60 minutes", shortLabel: "60 min",  days: 0,   isRealtime: true  },
  { value: "today", label: "Today",           shortLabel: "Today",   days: 1,   isRealtime: false },
  { value: "7d",    label: "Last 7 days",     shortLabel: "7 days",  days: 7,   isRealtime: false },
  { value: "28d",   label: "Last 28 days",    shortLabel: "28 days", days: 28,  isRealtime: false },
  { value: "90d",   label: "Last 90 days",    shortLabel: "90 days", days: 90,  isRealtime: false },
  { value: "365d",  label: "Last 12 months",  shortLabel: "12 mo",   days: 365, isRealtime: false },
];

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

export default function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = DATE_RANGE_OPTIONS.find((o) => o.value === value) ?? DATE_RANGE_OPTIONS[3];

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const realtimeOptions = DATE_RANGE_OPTIONS.filter((o) => o.isRealtime);
  const historicalOptions = DATE_RANGE_OPTIONS.filter((o) => !o.isRealtime);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors hover:text-white"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#cbd5e1",
        }}
      >
        {selected.isRealtime ? (
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        ) : (
          <Calendar size={13} className="text-indigo-400" />
        )}
        <span>{selected.label}</span>
        <ChevronDown
          size={13}
          className="text-slate-500 transition-transform"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1.5 w-48 rounded-xl py-1.5 z-50"
          style={{
            background: "#0d1117",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
          }}
        >
          {/* Realtime group */}
          <p className="px-3 pt-1 pb-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            Realtime
          </p>
          {realtimeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-white/5"
              style={{ color: value === option.value ? "#4ade80" : "#94a3b8" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: value === option.value ? "#4ade80" : "#374151",
                }}
              />
              {option.label}
            </button>
          ))}

          <div className="my-1.5 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }} />

          {/* Historical group */}
          <p className="px-3 pt-0.5 pb-1.5 text-[10px] font-semibold text-slate-600 uppercase tracking-widest">
            Historical
          </p>
          {historicalOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => { onChange(option.value); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors hover:bg-white/5"
              style={{ color: value === option.value ? "#818cf8" : "#94a3b8" }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{
                  background: value === option.value ? "#818cf8" : "#374151",
                }}
              />
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
