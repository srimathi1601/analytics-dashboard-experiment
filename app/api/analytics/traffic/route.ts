import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

/**
 * GET /api/analytics/traffic?days=28
 *
 * Date boundaries match GA4 Reports Snapshot:
 *   - days=1 (Today):  startDate='today',    endDate='today',    dimension='hour'
 *   - days≤90:         startDate='NdaysAgo', endDate='yesterday', dimension='date'
 *   - days>90:         startDate='NdaysAgo', endDate='yesterday', dimension='yearMonth'
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.max(1, Math.min(365, parseInt(searchParams.get('days') ?? '28')));

    let startDate: string;
    let endDate: string;
    let dimension: string;

    if (days === 1) {
      startDate = 'today';
      endDate   = 'today';
      dimension = 'hour';
    } else if (days <= 90) {
      startDate = `${days}daysAgo`;
      endDate   = '1daysAgo'; // yesterday — completed days only, matches GA4
      dimension = 'date';
    } else {
      startDate = `${days}daysAgo`;
      endDate   = '1daysAgo';
      dimension = 'yearMonth';
    }

    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: dimension }],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'sessions' },
        { name: 'bounceRate' },
        { name: 'activeUsers' },
        { name: 'totalUsers' },
      ],
      orderBys: [{ dimension: { dimensionName: dimension }, desc: false }],
    });

    const formatLabel = (raw: string): string => {
      if (dimension === 'hour') {
        const h = parseInt(raw, 10);
        if (h === 0) return '12am';
        if (h < 12) return `${h}am`;
        if (h === 12) return '12pm';
        return `${h - 12}pm`;
      }
      if (dimension === 'yearMonth') {
        const d = new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-01`);
        return d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      // YYYYMMDD
      const d = new Date(`${raw.slice(0, 4)}-${raw.slice(4, 6)}-${raw.slice(6, 8)}`);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const data = response.rows?.map((row) => {
      const dims = row.dimensionValues ?? [];
      const vals = row.metricValues   ?? [];
      const bounceRateRaw = parseFloat(vals[2]?.value ?? '0');
      return {
        date:        formatLabel(dims[0]?.value ?? ''),
        pageviews:   parseInt(vals[0]?.value ?? '0'),
        sessions:    parseInt(vals[1]?.value ?? '0'),
        bounceRate:  parseFloat((bounceRateRaw * 100).toFixed(1)),
        activeUsers: parseInt(vals[3]?.value ?? '0'),
        totalUsers:  parseInt(vals[4]?.value ?? '0'),
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
      { status: 500 },
    );
  }
}
