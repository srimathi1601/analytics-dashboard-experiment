import { NextResponse } from 'next/server';
import client, { GA4_PROPERTY } from '@/lib/ga4';

/**
 * GET /api/analytics/languages
 *
 * Returns session/user/pageview breakdown by language version (en vs de)
 * detected from the pagePath prefix (/en/... vs /de/...).
 *
 * Response shape:
 * {
 *   en:    { sessions, users, pageviews, pct },
 *   de:    { sessions, users, pageviews, pct },
 *   other: { sessions, users, pageviews, pct },
 *   total: number,
 * }
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const days = searchParams.get('days') ?? '30';

  try {
    const [response] = await client.runReport({
      property: GA4_PROPERTY,
      dateRanges: [{ startDate: `${days}daysAgo`, endDate: 'today' }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [
        { name: 'sessions' },
        { name: 'activeUsers' },
        { name: 'screenPageViews' },
      ],
      limit: 500,
    });

    const lang = {
      en:    { sessions: 0, users: 0, pageviews: 0 },
      de:    { sessions: 0, users: 0, pageviews: 0 },
      other: { sessions: 0, users: 0, pageviews: 0 },
    };

    response.rows?.forEach((row) => {
      const path      = row.dimensionValues?.[0]?.value ?? '';
      const sessions  = parseInt(row.metricValues?.[0]?.value ?? '0');
      const users     = parseInt(row.metricValues?.[1]?.value ?? '0');
      const pageviews = parseInt(row.metricValues?.[2]?.value ?? '0');

      const key: 'en' | 'de' | 'other' =
        path === '/en' || path.startsWith('/en/') ? 'en' :
        path === '/de' || path.startsWith('/de/') ? 'de' : 'other';

      lang[key].sessions  += sessions;
      lang[key].users     += users;
      lang[key].pageviews += pageviews;
    });

    const total = lang.en.sessions + lang.de.sessions + lang.other.sessions || 1;
    const pct = (n: number) => parseFloat(((n / total) * 100).toFixed(1));

    return NextResponse.json({
      en:    { ...lang.en,    pct: pct(lang.en.sessions)    },
      de:    { ...lang.de,    pct: pct(lang.de.sessions)    },
      other: { ...lang.other, pct: pct(lang.other.sessions) },
      total: lang.en.sessions + lang.de.sessions + lang.other.sessions,
    });
  } catch (error: unknown) {
    console.error('[GA4 /languages] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch language data', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
