import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

/**
 * GET /api/analytics/countries
 *
 * Returns traffic breakdown by country for the last 30 days.
 * Used for:
 * - Website Analytics page → Country table
 * - Dashboard overview → Top Countries section
 *
 * Response shape:
 * [
 *   { country: "Germany", sessions: 8420, users: 6200, pct: 29.1 },
 *   ...
 * ]
 */
export async function GET() {
  try {
    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'country' },
        { name: 'countryId' }, // ISO 3166-1 alpha-2 code e.g. "DE", "US"
      ],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
      ],
      orderBys: [
        { metric: { metricName: 'sessions' }, desc: true },
      ],
      limit: 15, // top 15 countries
    });

    // Calculate total sessions for percentage
    const totalSessions = response.rows?.reduce((sum, row) => {
      return sum + parseInt(row.metricValues?.[0]?.value ?? '0');
    }, 0) ?? 1; // avoid division by zero

    const data = response.rows?.map((row) => {
      const dims        = row.dimensionValues ?? [];
      const vals        = row.metricValues   ?? [];
      const sessions    = parseInt(vals[0]?.value   ?? '0');
      const users       = parseInt(vals[1]?.value   ?? '0');
      const pageviews   = parseInt(vals[2]?.value   ?? '0');
      const bounceRaw   = parseFloat(vals[3]?.value ?? '0');

      const pct = parseFloat(((sessions / totalSessions) * 100).toFixed(1));

      return {
        country:     dims[0]?.value ?? 'Unknown',
        countryCode: dims[1]?.value ?? '',         // "DE", "US" etc — use for flag emoji
        sessions,
        users,
        pageviews,
        bounceRate:  parseFloat((bounceRaw * 100).toFixed(1)),
        pct,
      };
    }) ?? [];

    return NextResponse.json({
      countries: data,
      totalSessions,
    });
  } catch (error: unknown) {
    console.error('[GA4 /countries] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 countries data',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
