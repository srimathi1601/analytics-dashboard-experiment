import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

/**
 * GET /api/analytics/overview?days=28
 *
 * Date ranges match GA4 Reports Snapshot exactly:
 *   - Historical ranges (days >= 2): endDate = 'yesterday' (completed days only)
 *   - Today (days = 1): startDate = 'today', endDate = 'today'
 *
 * GA4 "Last 7 days"  → startDate='7daysAgo',  endDate='yesterday'
 * GA4 "Last 28 days" → startDate='28daysAgo', endDate='yesterday'
 * GA4 "Last 90 days" → startDate='90daysAgo', endDate='yesterday'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.max(1, Math.min(365, parseInt(searchParams.get('days') ?? '28')));

    let startDate: string;
    let endDate: string;
    let prevStartDate: string;
    let prevEndDate: string;

    if (days === 1) {
      // "Today" — include partial today data
      startDate     = 'today';
      endDate       = 'today';
      prevStartDate = 'yesterday';
      prevEndDate   = 'yesterday';
    } else {
      // All other ranges: end at yesterday to match GA4's completed-days reporting
      startDate     = `${days}daysAgo`;
      endDate       = '1daysAgo';
      prevStartDate = `${days * 2}daysAgo`;
      prevEndDate   = `${days + 1}daysAgo`;
    }

    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [
        { startDate, endDate, name: 'current' },
        { startDate: prevStartDate, endDate: prevEndDate, name: 'previous' },
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
        { name: 'engagementRate' },
        { name: 'eventCount' },
        { name: 'engagedSessions' },
      ],
    });

    const current  = response.rows?.[0]?.metricValues ?? [];
    const previous = response.rows?.[1]?.metricValues ?? [];

    const parse = (val: string | null | undefined) => parseFloat(val ?? '0');
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
    const engagementRate   = parse(current[8]?.value);
    const eventCount       = parse(current[9]?.value);
    const engagedSessions  = parse(current[10]?.value);

    const prevActiveUsers    = parse(previous[0]?.value);
    const prevTotalUsers     = parse(previous[1]?.value);
    const prevNewUsers       = parse(previous[2]?.value);
    const prevSessions       = parse(previous[3]?.value);
    const prevConversions    = parse(previous[4]?.value);
    const prevPageViews      = parse(previous[5]?.value);
    const prevEngagementRate = parse(previous[8]?.value);
    const prevEventCount     = parse(previous[9]?.value);
    const prevEngagedSessions = parse(previous[10]?.value);

    const formatDuration = (seconds: number): string => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}m ${s}s`;
    };

    return NextResponse.json({
      // GA4 "Users" metric = totalUsers (primary)
      totalUsers: {
        value: Math.round(totalUsers),
        growth: growthPct(totalUsers, prevTotalUsers),
      },
      // GA4 "Active users" = users with engaged session
      activeUsers: {
        value: Math.round(activeUsers),
        growth: growthPct(activeUsers, prevActiveUsers),
      },
      newUsers: {
        value: Math.round(newUsers),
        growth: growthPct(newUsers, prevNewUsers),
      },
      sessions: {
        value: Math.round(sessions),
        growth: growthPct(sessions, prevSessions),
      },
      // GA4 "Engaged sessions"
      engagedSessions: {
        value: Math.round(engagedSessions),
        growth: growthPct(engagedSessions, prevEngagedSessions),
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
      // GA4 "Engagement rate" = engagedSessions / sessions
      engagementRate: {
        value: parseFloat((engagementRate * 100).toFixed(1)),
        growth: growthPct(engagementRate, prevEngagementRate),
      },
      eventCount: {
        value: Math.round(eventCount),
        growth: growthPct(eventCount, prevEventCount),
      },
      // Metadata
      dateRange: { startDate, endDate, days },
    });
  } catch (error: unknown) {
    console.error('[GA4 /overview] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 overview data',
        detail: error instanceof Error ? error.message : String(error),
        hint: 'Check: (1) service-account.json exists, (2) GA4_PROPERTY_ID is correct, (3) service account has Viewer access in GA4 Property Access Management',
      },
      { status: 500 },
    );
  }
}
