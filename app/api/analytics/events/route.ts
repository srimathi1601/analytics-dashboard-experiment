import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

/**
 * GET /api/analytics/events
 *
 * Returns all GA4 events (including custom GTM events) for the last 30 days.
 * Used for the GTM Events page.
 *
 * This will automatically include any custom events you push via GTM:
 *   - presale_clicked
 *   - wallet_connected
 *   - token_purchase
 *   - cta_clicked
 *   - page_view, session_start, etc. (auto-collected by GA4)
 *
 * Response shape:
 * [
 *   { event_name: "presale_clicked", count: 3290, source: "GTM" },
 *   ...
 * ]
 */
export async function GET() {
  try {
    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
      dimensions: [
        { name: 'eventName' },
      ],
      metrics: [
        { name: 'eventCount' },
        { name: 'eventCountPerUser' },
        { name: 'totalUsers' },
      ],
      orderBys: [
        { metric: { metricName: 'eventCount' }, desc: true },
      ],
      limit: 25,
    });

    // Label events by likely source for display in the dashboard
    const getSource = (name: string): string => {
      const map: Record<string, string> = {
        page_view:            'Auto',
        session_start:        'Auto',
        first_visit:          'Auto',
        user_engagement:      'Auto',
        scroll:               'Auto',
        click:                'GTM',
        presale_clicked:      'Hero CTA',
        wallet_connected:     'Web3 Modal',
        token_purchase:       'Checkout',
        cta_clicked:          'Multiple',
        whitepaper_download:  'Docs Page',
        form_submit:          'Contact Form',
        video_play:           'Media',
        outbound_click:       'GTM',
      };
      return map[name] ?? 'GTM';
    };

    const data = response.rows?.map((row) => {
      const eventName = row.dimensionValues?.[0]?.value ?? '';
      const count     = parseInt(row.metricValues?.[0]?.value ?? '0');
      const perUser   = parseFloat(
        parseFloat(row.metricValues?.[1]?.value ?? '0').toFixed(2)
      );
      const users = parseInt(row.metricValues?.[2]?.value ?? '0');

      return {
        event_name:    eventName,
        count,
        per_user:      perUser,
        users_triggered: users,
        source:        getSource(eventName),
        last_triggered: 'Recent', // GA4 API doesn't return exact last time; use Realtime API for live
      };
    }) ?? [];

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('[GA4 /events] Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch GA4 events data',
        detail: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
