// ============================================================
// MOCK DATA — Replace all with real API calls on integration
// ============================================================

// TODO: GET /api/analytics/overview
export const overviewStats = {
  totalUsers: { value: 12450, growth: 14.2, trend: [8200, 9100, 9800, 10400, 11200, 11900, 12450] },
  sessions: { value: 28930, growth: 8.7, trend: [19000, 21000, 22500, 24100, 25800, 27300, 28930] },
  conversions: { value: 3.8, growth: 0.4, trend: [3.1, 3.2, 3.4, 3.5, 3.6, 3.7, 3.8] },
  revenue: { value: 94200, growth: 22.5, trend: [55000, 62000, 68000, 74000, 82000, 89000, 94200] },
  emailSubscribers: { value: 8340, growth: 5.9, trend: [6200, 6700, 7100, 7500, 7800, 8100, 8340] },
  activeUsers: { value: 4127, growth: 11.3, trend: [2800, 3100, 3400, 3700, 3900, 4050, 4127] },
};

// TODO: GET /api/analytics/website
export const trafficData = [
  { date: "Apr 14", pageviews: 3240, sessions: 2100, bounceRate: 42 },
  { date: "Apr 15", pageviews: 4180, sessions: 2840, bounceRate: 38 },
  { date: "Apr 16", pageviews: 3870, sessions: 2560, bounceRate: 44 },
  { date: "Apr 17", pageviews: 5120, sessions: 3400, bounceRate: 35 },
  { date: "Apr 18", pageviews: 4650, sessions: 3050, bounceRate: 37 },
  { date: "Apr 19", pageviews: 6230, sessions: 4120, bounceRate: 31 },
  { date: "Apr 20", pageviews: 5840, sessions: 3870, bounceRate: 33 },
];

export const topPages = [
  { page: "/home", views: 12450, avgTime: "2m 14s" },
  { page: "/presale", views: 8930, avgTime: "3m 47s" },
  { page: "/token", views: 6720, avgTime: "2m 58s" },
  { page: "/roadmap", views: 4210, avgTime: "1m 52s" },
  { page: "/docs", views: 3180, avgTime: "4m 31s" },
];

export const deviceData = [
  { name: "Desktop", value: 54, color: "#6366f1" },
  { name: "Mobile", value: 38, color: "#22d3ee" },
  { name: "Tablet", value: 8, color: "#a78bfa" },
];

export const countryData = [
  { country: "United States", sessions: 8420, pct: 29.1 },
  { country: "United Kingdom", sessions: 4130, pct: 14.3 },
  { country: "Germany", sessions: 2870, pct: 9.9 },
  { country: "Canada", sessions: 2340, pct: 8.1 },
  { country: "Australia", sessions: 1920, pct: 6.6 },
  { country: "India", sessions: 1640, pct: 5.7 },
];

// TODO: GET /api/analytics/gtm-events
export const gtmEvents = [
  { event_name: "wallet_connected", count: 4821, last_triggered: "2 min ago", source: "Web3 Modal" },
  { event_name: "presale_clicked", count: 3290, last_triggered: "5 min ago", source: "Hero CTA" },
  { event_name: "token_purchase", count: 1847, last_triggered: "12 min ago", source: "Checkout" },
  { event_name: "cta_clicked", count: 7634, last_triggered: "1 min ago", source: "Multiple" },
  { event_name: "page_view", count: 28930, last_triggered: "just now", source: "Global" },
  { event_name: "form_submit", count: 2104, last_triggered: "8 min ago", source: "Contact Form" },
  { event_name: "video_play", count: 934, last_triggered: "23 min ago", source: "Explainer" },
  { event_name: "whitepaper_download", count: 612, last_triggered: "34 min ago", source: "Docs Page" },
];

// TODO: GET /api/email/subscribers
export const emailSubscribers = {
  total: 8340,
  growth: 5.9,
  growthChart: [
    { month: "Oct", count: 5200 },
    { month: "Nov", count: 5800 },
    { month: "Dec", count: 6100 },
    { month: "Jan", count: 6700 },
    { month: "Feb", count: 7200 },
    { month: "Mar", count: 7800 },
    { month: "Apr", count: 8340 },
  ],
  list: [
    { email: "alex.morgan@gmail.com", source: "Presale Page", date: "Apr 20, 2026" },
    { email: "j.chen@protonmail.com", source: "Twitter Campaign", date: "Apr 19, 2026" },
    { email: "sarah.k@outlook.com", source: "Telegram Bot", date: "Apr 19, 2026" },
    { email: "m.rodriguez@yahoo.com", source: "Google Ads", date: "Apr 18, 2026" },
    { email: "devuser42@gmail.com", source: "Direct", date: "Apr 18, 2026" },
    { email: "crypto.whale@pm.me", source: "Referral", date: "Apr 17, 2026" },
    { email: "hodler99@gmail.com", source: "Presale Page", date: "Apr 17, 2026" },
    { email: "block.investor@icloud.com", source: "Twitter Campaign", date: "Apr 16, 2026" },
  ],
};

// TODO: GET /api/analytics/marketing
export const marketingData = {
  sources: [
    { name: "Twitter", value: 9840, color: "#6366f1" },
    { name: "Telegram", value: 7210, color: "#22d3ee" },
    { name: "Google", value: 6430, color: "#a78bfa" },
    { name: "Direct", value: 5450, color: "#f472b6" },
  ],
  campaigns: [
    { name: "Presale Launch", channel: "Twitter", clicks: 4820, conversions: 312, ctr: 6.5, spend: 2400 },
    { name: "Token Sale Q2", channel: "Google", clicks: 3940, conversions: 241, ctr: 6.1, spend: 3100 },
    { name: "Community AMA", channel: "Telegram", clicks: 2870, conversions: 198, ctr: 6.9, spend: 800 },
    { name: "Whitepaper Drop", channel: "Direct", clicks: 1920, conversions: 134, ctr: 7.0, spend: 500 },
    { name: "Airdrop Campaign", channel: "Twitter", clicks: 6210, conversions: 418, ctr: 6.7, spend: 3800 },
  ],
  channelConversions: [
    { channel: "Twitter", conversions: 730, rate: 4.2 },
    { channel: "Telegram", conversions: 540, rate: 5.8 },
    { channel: "Google", conversions: 380, rate: 3.9 },
    { channel: "Direct", conversions: 197, rate: 6.1 },
  ],
};

// TODO: GET /api/analytics/app
export const appAnalytics = {
  installs: { value: 6840, growth: 18.4 },
  dau: { value: 2310, growth: 9.7 },
  retentionChart: [
    { day: "Day 1", retention: 100 },
    { day: "Day 3", retention: 68 },
    { day: "Day 7", retention: 45 },
    { day: "Day 14", retention: 32 },
    { day: "Day 30", retention: 21 },
    { day: "Day 60", retention: 14 },
    { day: "Day 90", retention: 9 },
  ],
  installsChart: [
    { week: "W1", ios: 420, android: 380 },
    { week: "W2", ios: 580, android: 490 },
    { week: "W3", ios: 720, android: 640 },
    { week: "W4", ios: 890, android: 780 },
    { week: "W5", ios: 1040, android: 920 },
    { week: "W6", ios: 1280, android: 1090 },
  ],
};

// ============================================================
// SQL DATABASE SCHEMA (for future integration)
// ============================================================

/*
-- analytics_overview
CREATE TABLE analytics_overview (
  id SERIAL PRIMARY KEY,
  recorded_at TIMESTAMP DEFAULT NOW(),
  total_users INTEGER,
  sessions INTEGER,
  conversion_rate DECIMAL(5,2),
  revenue DECIMAL(12,2),
  email_subscribers INTEGER,
  active_users INTEGER
);

-- website_traffic
CREATE TABLE website_traffic (
  id SERIAL PRIMARY KEY,
  recorded_date DATE,
  pageviews INTEGER,
  sessions INTEGER,
  bounce_rate DECIMAL(5,2),
  page_path VARCHAR(512)
);

-- gtm_events
CREATE TABLE gtm_events (
  id SERIAL PRIMARY KEY,
  event_name VARCHAR(255),
  event_count INTEGER,
  last_triggered TIMESTAMP,
  source VARCHAR(255)
);

-- email_subscribers
CREATE TABLE email_subscribers (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(255),
  subscribed_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);

-- marketing_campaigns
CREATE TABLE marketing_campaigns (
  id SERIAL PRIMARY KEY,
  campaign_name VARCHAR(255),
  channel VARCHAR(100),
  clicks INTEGER,
  conversions INTEGER,
  ctr DECIMAL(5,2),
  spend DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT NOW()
);

-- app_analytics
CREATE TABLE app_analytics (
  id SERIAL PRIMARY KEY,
  recorded_at TIMESTAMP DEFAULT NOW(),
  platform VARCHAR(50),
  installs INTEGER,
  dau INTEGER,
  retention_day INTEGER,
  retention_rate DECIMAL(5,2)
);
*/

// ============================================================
// JAVA SPRING BOOT REST ENDPOINTS (for future integration)
// ============================================================

/*
@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {

  // GET /api/analytics/overview
  @GetMapping("/overview")
  public ResponseEntity<OverviewStats> getOverview() { ... }

  // GET /api/analytics/website
  @GetMapping("/website")
  public ResponseEntity<WebsiteAnalytics> getWebsiteAnalytics(
    @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate from,
    @RequestParam @DateTimeFormat(iso=DateTimeFormat.ISO.DATE) LocalDate to
  ) { ... }

  // GET /api/analytics/gtm-events
  @GetMapping("/gtm-events")
  public ResponseEntity<List<GtmEvent>> getGtmEvents() { ... }

  // GET /api/analytics/marketing
  @GetMapping("/marketing")
  public ResponseEntity<MarketingAnalytics> getMarketingAnalytics() { ... }

  // GET /api/analytics/app
  @GetMapping("/app")
  public ResponseEntity<AppAnalytics> getAppAnalytics() { ... }
}

@RestController
@RequestMapping("/api/email")
public class EmailController {

  // GET /api/email/subscribers
  @GetMapping("/subscribers")
  public ResponseEntity<SubscriberResponse> getSubscribers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
  ) { ... }
}
*/
