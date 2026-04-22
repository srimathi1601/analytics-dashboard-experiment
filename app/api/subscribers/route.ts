import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const DB = path.join(process.cwd(), 'data', 'subscribers.json');

export async function GET() {
  try {
    const raw = fs.existsSync(DB) ? fs.readFileSync(DB, 'utf8') : '[]';
    const list = JSON.parse(raw);

    // Group by month for the growth chart
    const byMonth: Record<string, number> = {};
    for (const s of list) {
      const month = new Date(s.subscribedAt).toLocaleString('en-US', { month: 'short', year: '2-digit' });
      byMonth[month] = (byMonth[month] ?? 0) + 1;
    }

    // Running cumulative count for the chart
    let running = 0;
    const growthChart = Object.entries(byMonth).map(([month, count]) => {
      running += count;
      return { month, count: running };
    });

    // Source breakdown counts
    const bySource: Record<string, number> = {};
    for (const s of list) {
      bySource[s.source] = (bySource[s.source] ?? 0) + 1;
    }

    return NextResponse.json({
      total: list.length,
      list: list.slice(-50).reverse(), // latest 50
      growthChart,
      bySource,
    });
  } catch (err) {
    console.error('[GET /api/subscribers]', err);
    return NextResponse.json({ error: 'Failed to read subscribers' }, { status: 500 });
  }
}
