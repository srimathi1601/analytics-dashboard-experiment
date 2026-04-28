import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

const signupFilter = {
  filter: {
    fieldName: 'eventName',
    stringFilter: { value: 'newsletter_signup', matchType: 'EXACT' as const },
  },
};

export async function GET() {
  try {
    const [
      [overviewRes],
      [dateRes],
      [weekRes],
      [sourceRes],
      [countryRes],
      [locationRes],
      [statusRes],
      [siteViewsRes],
      [trafficRes],
    ] = await Promise.all([
      // Total signups, unique users, active users (180 days)
      client.runReport({
        property: GA4_PROPERTY,
        dateRanges: [{ startDate: '180daysAgo', endDate: 'today' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }, { name: 'activeUsers' }],
        dimensionFilter: signupFilter,
      }),
      // Growth by date
      client.runReport({
        property: GA4_PROPERTY,
        dateRanges: [{ startDate: '180daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'date' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: signupFilter,
        orderBys: [{ dimension: { dimensionName: 'date' }, desc: false }],
      }),
      // This week count
      client.runReport({
        property: GA4_PROPERTY,
        dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
        metrics: [{ name: 'eventCount' }],
        dimensionFilter: signupFilter,
      }),
      // Source breakdown
      client.runReport({
        property: GA4_PROPERTY,
        dateRanges: [{ startDate: '180daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
        dimensionFilter: signupFilter,
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 10,
      }),
      // Country breakdown
      client.runReport({
        property: GA4_PROPERTY,
        dateRanges: [{ startDate: '180daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'country' }, { name: 'countryId' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
        dimensionFilter: signupFilter,
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
        limit: 15,
      }),
      // signup_location custom event parameter (e.g. "train_with_best", "footer")
      client.runReport({
        property: GA4_PROPERTY,
        dateRanges: [{ startDate: '180daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'customEvent:signup_location' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
        dimensionFilter: signupFilter,
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      }),
      // signup_status custom event parameter (e.g. "success")
      client.runReport({
        property: GA4_PROPERTY,
        dateRanges: [{ startDate: '180daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'customEvent:signup_status' }],
        metrics: [{ name: 'eventCount' }, { name: 'totalUsers' }],
        dimensionFilter: signupFilter,
        orderBys: [{ metric: { metricName: 'eventCount' }, desc: true }],
      }),
      // Overall site page views (last 30 days, no event filter)
      client.runReport({
        property: GA4_PROPERTY,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        metrics: [{ name: 'screenPageViews' }],
      }),
      // Traffic sources — sessions, users, active users, duration, sessions/user, engagement rate
      client.runReport({
        property: GA4_PROPERTY,
        dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
        dimensions: [{ name: 'sessionSource' }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'activeUsers' },
          { name: 'averageSessionDuration' },
          { name: 'sessionsPerUser' },
          { name: 'engagementRate' },
        ],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      }),
    ]);

    // Overview scalars
    const ov = overviewRes.rows?.[0]?.metricValues ?? [];
    const totalSignups = parseInt(ov[0]?.value ?? '0');
    const totalUsers   = parseInt(ov[1]?.value ?? '0');
    const activeUsers  = parseInt(ov[2]?.value ?? '0');
    const thisWeek     = parseInt(weekRes.rows?.[0]?.metricValues?.[0]?.value ?? '0');
    const pageViews    = parseInt(siteViewsRes.rows?.[0]?.metricValues?.[0]?.value ?? '0');

    // Growth chart — group daily into months, cumulative
    const monthMap: Record<string, number> = {};
    for (const row of dateRes.rows ?? []) {
      const yyyymmdd = row.dimensionValues?.[0]?.value ?? '';
      const count = parseInt(row.metricValues?.[0]?.value ?? '0');
      if (yyyymmdd.length !== 8) continue;
      const d = new Date(
        parseInt(yyyymmdd.slice(0, 4)),
        parseInt(yyyymmdd.slice(4, 6)) - 1,
        parseInt(yyyymmdd.slice(6, 8))
      );
      const month = d.toLocaleString('en-US', { month: 'short', year: '2-digit' });
      monthMap[month] = (monthMap[month] ?? 0) + count;
    }
    let running = 0;
    const growthChart = Object.entries(monthMap).map(([month, count]) => {
      running += count;
      return { month, count: running };
    });

    // Source breakdown
    const bySource = (sourceRes.rows ?? []).map((row) => {
      const raw = row.dimensionValues?.[0]?.value ?? 'direct';
      return {
        source:  raw === '(direct)' || raw === 'direct' ? 'Direct' : raw,
        signups: parseInt(row.metricValues?.[0]?.value ?? '0'),
        users:   parseInt(row.metricValues?.[1]?.value ?? '0'),
      };
    });

    // Country breakdown
    const totalForPct = (countryRes.rows ?? []).reduce(
      (s, r) => s + parseInt(r.metricValues?.[0]?.value ?? '0'), 0
    ) || 1;
    const byCountry = (countryRes.rows ?? []).map((row) => {
      const signups = parseInt(row.metricValues?.[0]?.value ?? '0');
      return {
        country:     row.dimensionValues?.[0]?.value ?? 'Unknown',
        countryCode: row.dimensionValues?.[1]?.value ?? '',
        signups,
        users: parseInt(row.metricValues?.[1]?.value ?? '0'),
        pct:   parseFloat(((signups / totalForPct) * 100).toFixed(1)),
      };
    });

    // signup_location custom parameter (e.g. "train_with_best", "footer")
    const byLocation = (locationRes.rows ?? []).map((row) => ({
      location: row.dimensionValues?.[0]?.value ?? '(unknown)',
      signups:  parseInt(row.metricValues?.[0]?.value ?? '0'),
      users:    parseInt(row.metricValues?.[1]?.value ?? '0'),
    }));

    // signup_status custom parameter (e.g. "success")
    const byStatus = (statusRes.rows ?? []).map((row) => ({
      status:  row.dimensionValues?.[0]?.value ?? '(unknown)',
      signups: parseInt(row.metricValues?.[0]?.value ?? '0'),
      users:   parseInt(row.metricValues?.[1]?.value ?? '0'),
    }));

    // Overall traffic sources table (last 30 days, no event filter)
    const fmtDuration = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = Math.floor(sec % 60);
      return m > 0 ? `${m}m ${s}s` : `${s}s`;
    };
    const trafficSources = (trafficRes.rows ?? []).map((row) => {
      const raw = row.dimensionValues?.[0]?.value ?? 'direct';
      return {
        source:          raw === '(direct)' || raw === 'direct' ? 'Direct' : raw,
        sessions:        parseInt(row.metricValues?.[0]?.value ?? '0'),
        users:           parseInt(row.metricValues?.[1]?.value ?? '0'),
        activeUsers:     parseInt(row.metricValues?.[2]?.value ?? '0'),
        avgDuration:     fmtDuration(parseFloat(row.metricValues?.[3]?.value ?? '0')),
        sessionsPerUser: parseFloat(parseFloat(row.metricValues?.[4]?.value ?? '0').toFixed(2)),
        engagementRate:  parseFloat((parseFloat(row.metricValues?.[5]?.value ?? '0') * 100).toFixed(1)),
      };
    });

    return NextResponse.json({
      totalSignups,
      thisWeek,
      totalUsers,
      activeUsers,
      pageViews,
      growthChart,
      bySource,
      byCountry,
      byLocation,
      byStatus,
      trafficSources,
    });
  } catch (error: unknown) {
    console.error('[GA4 /subscriptions] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 subscription data',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
