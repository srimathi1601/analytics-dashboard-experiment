import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

/**
 * GET /api/analytics/overview
 *
 * Returns top-level metrics for the dashboard overview cards:
 * - activeUsers      → "Active Users" card
 * - totalUsers       → "Total Users" card
 * - newUsers         → used for growth % calculation
 * - sessions         → "Sessions" card
 * - conversions      → "Conversions" card
 * - screenPageViews  → total pageviews
 * - bounceRate       → bounce rate %
 *
 * Compares current 7 days vs previous 7 days to calculate growth %.
 *
 * GA4 Dimensions/Metrics reference:
 * https://developers.google.com/analytics/devguides/reporting/data/v1/api-schema
 */
export async function GET() {
  try {
    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [
        { startDate: '7daysAgo', endDate: 'today', name: 'current' },
        { startDate: '14daysAgo', endDate: '8daysAgo', name: 'previous' },
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'totalUsers' },
        { name: 'newUsers' },
        { name: 'sessions' },
        { name: 'conversions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
    });

    // Current period row (index 0) and previous period row (index 1)
    const current = response.rows?.[0]?.metricValues ?? [];
    const previous = response.rows?.[1]?.metricValues ?? [];

    const parse = (val: string | null | undefined) =>
      parseFloat(val ?? '0');

    const growthPct = (curr: number, prev: number): number => {
      if (prev === 0) return 0;
      return parseFloat((((curr - prev) / prev) * 100).toFixed(1));
    };

    const activeUsers      = parse(current[0]?.value);
    const totalUsers       = parse(current[1]?.value);
    const newUsers         = parse(current[2]?.value);
    const sessions         = parse(current[3]?.value);
    const conversions      = parse(current[4]?.value);
    const pageViews        = parse(current[5]?.value);
    const bounceRate       = parse(current[6]?.value);
    const avgSessionDur    = parse(current[7]?.value);

    const prevActiveUsers  = parse(previous[0]?.value);
    const prevTotalUsers   = parse(previous[1]?.value);
    const prevNewUsers     = parse(previous[2]?.value);
    const prevSessions     = parse(previous[3]?.value);
    const prevConversions  = parse(previous[4]?.value);
    const prevPageViews    = parse(previous[5]?.value);

    // Format avg session duration from seconds → "Xm Ys"
    const formatDuration = (seconds: number): string => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}m ${s}s`;
    };

    return NextResponse.json({
      activeUsers: {
        value: Math.round(activeUsers),
        growth: growthPct(activeUsers, prevActiveUsers),
      },
      totalUsers: {
        value: Math.round(totalUsers),
        growth: growthPct(totalUsers, prevTotalUsers),
      },
      newUsers: {
        value: Math.round(newUsers),
        growth: growthPct(newUsers, prevNewUsers),
      },
      sessions: {
        value: Math.round(sessions),
        growth: growthPct(sessions, prevSessions),
      },
      conversions: {
        value: Math.round(conversions),
        growth: growthPct(conversions, prevConversions),
      },
      pageViews: {
        value: Math.round(pageViews),
        growth: growthPct(pageViews, prevPageViews),
      },
      bounceRate: {
        value: parseFloat((bounceRate * 100).toFixed(1)),
      },
      avgSessionDuration: {
        value: formatDuration(avgSessionDur),
        raw: Math.round(avgSessionDur),
      },
    });
  } catch (error: unknown) {
    console.error('[GA4 /overview] Error:', error);

    // Return a clear error so you can debug in the browser
    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 overview data',
        detail: error instanceof Error ? error.message : String(error),
        hint: 'Check: (1) service-account.json exists, (2) GA4_PROPERTY_ID is correct, (3) service account email has Viewer access in GA4 Property Access Management',
      },
      { status: 500 }
    );
  }
}
