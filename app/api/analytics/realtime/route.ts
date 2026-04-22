import { BetaAnalyticsDataClient } from "@google-analytics/data";
import { NextResponse } from "next/server";

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

export async function GET() {
  const rawId = process.env.GA4_PROPERTY_ID;
  if (!rawId) {
    return NextResponse.json({ error: "GA4_PROPERTY_ID is not set" }, { status: 500 });
  }
  const propertyId = `properties/${rawId}`;

  try {
    const client = getClient();

    // Realtime report — events fired in the last 30 minutes
    const [realtime] = await client.runRealtimeReport({
      property: propertyId,
      dimensions: [{ name: "eventName" }],
      metrics: [{ name: "eventCount" }],
    });

    // Active users right now
    const [activeUsersReport] = await client.runRealtimeReport({
      property: propertyId,
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
