import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { NextResponse } from "next/server";

const SOURCE_MAP: Record<string, string> = {
  buy_now_click: "Hero CTA",
  whitepaper_click: "Docs Page",
  presale_join_click: "Hero CTA",
  newsletter_subscribe: "Newsletter Form",
  social_icon_click: "Community Section",
  footer_click: "Footer",
  powered_by_click: "Powered By Section",
};

function getClient() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (key) {
    const creds = JSON.parse(key);
    if (typeof creds.private_key === 'string') {
      creds.private_key = creds.private_key.replace(/\\n/g, '\n');
    }
    return new BetaAnalyticsDataClient({ credentials: creds });
  }
  const keyFile = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyFile) {
    return new BetaAnalyticsDataClient({ keyFilename: keyFile });
  }
  throw new Error("No credentials: set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_APPLICATION_CREDENTIALS in .env.local");
}

export async function GET(request: Request) {
  const rawId = process.env.GA4_PROPERTY_ID;
  if (!rawId) {
    return NextResponse.json({ error: "GA4_PROPERTY_ID is not set" }, { status: 500 });
  }
  const propertyId = `properties/${rawId}`;

  const { searchParams } = new URL(request.url);
  const days = searchParams.get("days") ?? "30";

  try {
    const client = getClient();

    const [response] = await client.runReport({
      property: propertyId,
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
