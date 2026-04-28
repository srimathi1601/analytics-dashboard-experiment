import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

/**
 * GET /api/analytics/countries?days=28
 * endDate = yesterday for all ranges ≥ 2 days (matches GA4 completed-days reporting).
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.max(1, Math.min(365, parseInt(searchParams.get('days') ?? '28')));

    const startDate = days === 1 ? 'today' : `${days}daysAgo`;
    const endDate   = days === 1 ? 'today' : '1daysAgo';

    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'country' },
        { name: 'countryId' },
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 15,
    });

    const totalSessions = response.rows?.reduce(
      (sum, row) => sum + parseInt(row.metricValues?.[0]?.value ?? '0'),
      0,
    ) ?? 1;

    const countries = response.rows?.map((row) => {
      const dims      = row.dimensionValues ?? [];
      const vals      = row.metricValues   ?? [];
      const sessions  = parseInt(vals[0]?.value   ?? '0');
      const users     = parseInt(vals[1]?.value   ?? '0');
      const pageviews = parseInt(vals[2]?.value   ?? '0');
      const bounceRaw = parseFloat(vals[3]?.value ?? '0');

      return {
        country:     dims[0]?.value ?? 'Unknown',
        countryCode: dims[1]?.value ?? '',
        sessions,
        users,
        pageviews,
        bounceRate: parseFloat((bounceRaw * 100).toFixed(1)),
        pct:        parseFloat(((sessions / totalSessions) * 100).toFixed(1)),
      };
    }) ?? [];

    return NextResponse.json({ countries, totalSessions });
  } catch (error: unknown) {
    console.error('[GA4 /countries] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 countries data',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
