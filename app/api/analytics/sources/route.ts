import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

const CHANNEL_COLORS: Record<string, string> = {
  'Organic Search': '#34d399',
  'Direct': '#818cf8',
  'Referral': '#22d3ee',
  'Organic Social': '#f472b6',
  'Paid Search': '#fbbf24',
  'Email': '#a78bfa',
  'Display': '#fb923c',
  'Affiliates': '#38bdf8',
  'Unassigned': '#475569',
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = Math.max(1, Math.min(365, parseInt(searchParams.get('days') ?? '30')));
    const startDate = days === 1 ? 'today' : `${days}daysAgo`;
    const endDate   = days === 1 ? 'today' : '1daysAgo';

    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'conversions' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    });

    const totalSessions = response.rows?.reduce(
      (sum, row) => sum + parseInt(row.metricValues?.[0]?.value ?? '0'),
      0,
    ) ?? 1;

    const sources = response.rows?.map((row) => {
      const channel = row.dimensionValues?.[0]?.value ?? 'Unassigned';
      const sessions = parseInt(row.metricValues?.[0]?.value ?? '0');
      const users = parseInt(row.metricValues?.[1]?.value ?? '0');
      const conversions = parseInt(row.metricValues?.[2]?.value ?? '0');
      return {
        channel,
        sessions,
        users,
        conversions,
        pct: parseFloat(((sessions / totalSessions) * 100).toFixed(1)),
        color: CHANNEL_COLORS[channel] ?? '#64748b',
      };
    }) ?? [];

    return NextResponse.json({ sources, totalSessions });
  } catch (error: unknown) {
    console.error('[GA4 /sources] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch traffic sources',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
