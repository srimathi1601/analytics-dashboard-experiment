import { NextResponse } from "next/server";
import client, { GA4_PROPERTY } from "@/lib/ga4";

// Sportstech.io custom event names fired via GTM-P6JM5VS2
const TRACKED_EVENTS = [
  "buy_now_click",
  "whitepaper_click",
  "presale_join_click",
  "newsletter_subscribe",
  "social_icon_click",
  "footer_click",
  "powered_by_click",
];

export async function GET() {
  try {

    // Realtime report — events fired in the last 30 minutes
    const [realtime] = await client.runRealtimeReport({
      property: GA4_PROPERTY,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
    });

    // Active users right now
    const [activeUsersReport] = await client.runRealtimeReport({
      property: GA4_PROPERTY,
      metrics: [{ name: "activeUsers" }],
    });

    const activeUsers = parseInt(
      activeUsersReport.rows?.[0]?.metricValues?.[0]?.value ?? "0"
    );

    const events = (realtime.rows ?? [])
      .map((row) => ({
        event_name: row.dimensionValues?.[0]?.value ?? "",
        count: parseInt(row.metricValues?.[0]?.value ?? "0"),
        last_triggered: "< 30 min ago",
        source: "sportstech.io",
        is_custom: TRACKED_EVENTS.includes(row.dimensionValues?.[0]?.value ?? ""),
      }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({ events, activeUsers, fetchedAt: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
