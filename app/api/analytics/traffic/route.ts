import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

/**
 * GET /api/analytics/traffic
 *
 * Returns daily traffic data for the last 7 days.
 * Used for the Traffic Line Chart on:
 * - Dashboard overview page
 * - Website Analytics page
 *
 * Response shape:
 * [
 *   { date: "Apr 14", pageviews: 3240, sessions: 2100, bounceRate: 42 },
 *   ...
 * ]
 */
export async function GET() {
  try {
    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'date' }], // returns YYYYMMDD format
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'activeUsers' },
      ],
      orderBys: [
        { dimension: { dimensionName: 'date' }, desc: false },
      ],
    });

    // Format YYYYMMDD → "Apr 14"
    const formatDate = (raw: string): string => {
      const year  = raw.slice(0, 4);
      const month = raw.slice(4, 6);
      const day   = raw.slice(6, 8);
      const d = new Date(`${year}-${month}-${day}`);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const data = response.rows?.map((row) => {
      const dims = row.dimensionValues ?? [];
      const vals = row.metricValues   ?? [];
      const bounceRateRaw = parseFloat(vals[2]?.value ?? '0');

      return {
        date:       formatDate(dims[0]?.value ?? ''),
        pageviews:  parseInt(vals[0]?.value ?? '0'),
        sessions:   parseInt(vals[1]?.value ?? '0'),
        bounceRate: parseFloat((bounceRateRaw * 100).toFixed(1)),
        activeUsers: parseInt(vals[3]?.value ?? '0'),
      };
    }) ?? [];

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[GA4 /traffic] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 traffic data',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
