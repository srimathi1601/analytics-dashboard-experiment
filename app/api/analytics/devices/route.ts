import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

const DEVICE_COLORS: Record<string, string> = {
  desktop: '#6366f1',
  mobile:  '#22d3ee',
  tablet:  '#a78bfa',
};

/**
 * GET /api/analytics/devices
 *
 * Returns real device category breakdown from GA4 for the last 30 days.
 * Response matches the DevicePieChart data shape: { name, value (%), color }.
 *
 * Response shape:
 * {
 *   devices: [{ name: "Desktop", value: 54.2, sessions: 12300, color: "#6366f1" }],
 *   totalSessions: number,
 * }
 */
export async function GET() {
  try {
    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
      ],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    });

    const totalSessions = response.rows?.reduce(
      (sum, row) => sum + parseInt(row.metricValues?.[0]?.value ?? '0'),
      0
    ) || 1;

    const devices = response.rows?.map((row) => {
      const device   = (row.dimensionValues?.[0]?.value ?? '').toLowerCase();
      const sessions = parseInt(row.metricValues?.[0]?.value ?? '0');
      const users    = parseInt(row.metricValues?.[1]?.value ?? '0');
      const pct      = parseFloat(((sessions / totalSessions) * 100).toFixed(1));

      return {
        name:     device.charAt(0).toUpperCase() + device.slice(1),
        value:    pct,
        sessions,
        users,
        color:    DEVICE_COLORS[device] ?? '#94a3b8',
      };
    }) ?? [];

    return NextResponse.json({ devices, totalSessions });
  } catch (error: unknown) {
    console.error('[GA4 /devices] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device data', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
