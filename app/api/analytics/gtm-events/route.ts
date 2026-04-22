import { NextResponse } from "next/server";
import client, { GA4_PROPERTY } from "@/lib/ga4";

const SOURCE_MAP: Record<string, string> = {
  buy_now_click: "Hero CTA",
  whitepaper_click: "Docs Page",
  presale_join_click: "Hero CTA",
  newsletter_subscribe: "Newsletter Form",
  social_icon_click: "Community Section",
  footer_click: "Footer",
  powered_by_click: "Powered By Section",
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get("days") ?? "30";

  try {
    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: "today" }],
      dimensions: [{ name: "eventName" }, { name: "date" }],
      metrics: [{ name: "eventCount" }],
      orderBys: [{ metric: { metricName: "eventCount" }, desc: true }],
    });

    // Group by event name, sum counts across dates
    const eventMap = new Map<string, { count: number; lastDate: string }>();
    for (const row of response.rows ?? []) {
      const name = row.dimensionValues?.[0]?.value ?? "";
      const date = row.dimensionValues?.[1]?.value ?? "";
      const count = parseInt(row.metricValues?.[0]?.value ?? "0");
      const existing = eventMap.get(name);
      if (existing) {
        existing.count += count;
        if (date > existing.lastDate) existing.lastDate = date;
      } else {
        eventMap.set(name, { count, lastDate: date });
      }
    }

    const events = Array.from(eventMap.entries())
      .map(([event_name, { count, lastDate }]) => ({
        event_name,
        count,
        last_triggered: formatDate(lastDate),
        source: SOURCE_MAP[event_name] ?? "sportstech.io",
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ events, fetchedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

function formatDate(yyyymmdd: string): string {
  if (!yyyymmdd || yyyymmdd.length !== 8) return "recently";
  const y = yyyymmdd.slice(0, 4);
  const m = yyyymmdd.slice(4, 6);
  const d = yyyymmdd.slice(6, 8);
  return `${y}-${m}-${d}`;
}
