import { BetaAnalyticsDataClient } from '@google-analytics/data';

function parseCredentials(raw: string) {
  const creds = JSON.parse(raw);
  // .env.local stores \n as literal backslash-n; convert to real newlines
  if (typeof creds.private_key === 'string') {
    creds.private_key = creds.private_key.replace(/\\n/g, '\n');
  }
  return creds;
}

const rawKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

const client = new BetaAnalyticsDataClient(
  rawKey
    ? { credentials: parseCredentials(rawKey) }
    : { keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS }
);

export const GA4_PROPERTY = `properties/${process.env.GA4_PROPERTY_ID}`;
export default client;