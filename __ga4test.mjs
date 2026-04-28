import { readFileSync } from 'fs';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

const raw = readFileSync('.env.local', 'utf8');
const env = {};
for (const line of raw.split('\n')) {
  const eq = line.indexOf('=');
  if (eq < 1) continue;
  const k = line.slice(0, eq).trim();
  let v = line.slice(eq + 1).trim();
  if (v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
  env[k] = v;
}

const client = new BetaAnalyticsDataClient({
  credentials: {
    type: 'service_account',
    project_id: env.GOOGLE_PROJECT_ID,
    private_key_id: env.GOOGLE_PRIVATE_KEY_ID,
    private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: env.GOOGLE_CLIENT_EMAIL,
    client_id: env.GOOGLE_CLIENT_ID,
  },
});

const PROPERTY = 'properties/' + env.GA4_PROPERTY_ID;

const ranges = [
  ['[A] 7daysAgo → today  (our current API)',         '7daysAgo',  'today'],
  ['[B] 7daysAgo → yesterday  (GA4 "last 7 days")',   '7daysAgo',  '1daysAgo'],
  ['[C] 6daysAgo → today  (GA4 alt 7-day)',           '6daysAgo',  'today'],
  ['[D] 28daysAgo → yesterday  (GA4 default range)',  '28daysAgo', '1daysAgo'],
  ['[E] 28daysAgo → today  (our 28d range)',          '28daysAgo', 'today'],
  ['[F] March 2026 exact  (2026-03-01 → 2026-03-31)', '2026-03-01','2026-03-31'],
  ['[G] 30daysAgo → yesterday',                       '30daysAgo', '1daysAgo'],
];

for (const [label, startDate, endDate] of ranges) {
  const [r] = await client.runReport({
    property: PROPERTY,
    dateRanges: [{ startDate, endDate }],
    metrics: [
      { name: 'totalUsers' },
      { name: 'activeUsers' },
      { name: 'newUsers' },
      { name: 'sessions' },
    ],
  });
  const v = r.rows?.[0]?.metricValues ?? [];
  console.log(label);
  console.log(
    `  totalUsers=${v[0]?.value}  activeUsers=${v[1]?.value}  newUsers=${v[2]?.value}  sessions=${v[3]?.value}`
  );
}
