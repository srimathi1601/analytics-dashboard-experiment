import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

/**
 * GET /api/analytics/pages
 *
 * Returns top pages by pageviews for the last 30 days.
 * Used for:
 * - Website Analytics page → Top Pages bar chart
 * - Website Analytics page → Top Pages table
 *
 * Response shape:
 * [
 *   {
 *     page: "/en",
 *     title: "Sportstech Neo | Move-to-Earn",
 *     views: 12450,
 *     sessions: 8200,
 *     avgTimeOnPage: "2m 14s",
 *     bounceRate: 38.2,
 *   },
 *   ...
 * ]
 */
export async function GET() {
  try {
    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'pagePath' },       // e.g. /en, /en/presale
        { name: 'pageTitle' },      // the <title> tag of the page
      ],
      metrics: [
        { name: 'screenPageViews' },         // pageviews
        { name: 'sessions' },
        { name: 'averageSessionDuration' },  // seconds
        { name: 'bounceRate' },
        { name: 'activeUsers' },
      ],
      orderBys: [
        { metric: { metricName: 'screenPageViews' }, desc: true },
      ],
      limit: 10, // top 10 pages
    });

    const formatDuration = (seconds: number): string => {
      const m = Math.floor(seconds / 60);
      const s = Math.floor(seconds % 60);
      return `${m}m ${s}s`;
    };

    const data = response.rows?.map((row) => {
      const dims    = row.dimensionValues ?? [];
      const vals    = row.metricValues   ?? [];
      const pageviews    = parseInt(vals[0]?.value   ?? '0');
      const sessions     = parseInt(vals[1]?.value   ?? '0');
      const avgDurSecs   = parseFloat(vals[2]?.value ?? '0');
      const bounceRaw    = parseFloat(vals[3]?.value ?? '0');
      const activeUsers  = parseInt(vals[4]?.value   ?? '0');

      return {
        page:           dims[0]?.value ?? '/',
        title:          dims[1]?.value ?? '',
        views:          pageviews,
        sessions,
        activeUsers,
        avgTimeOnPage:  formatDuration(avgDurSecs),
        avgTimeSeconds: Math.round(avgDurSecs),
        bounceRate:     parseFloat((bounceRaw * 100).toFixed(1)),
      };
    }) ?? [];

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[GA4 /pages] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 pages data',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
