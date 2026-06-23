const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3014;
const DATA_DIR = path.join(__dirname, 'data');
const LOG_FILE = path.join(DATA_DIR, 'pageviews.json');
const WEBSITE_DIR = path.join(__dirname, '..');

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LOG_FILE)) fs.writeFileSync(LOG_FILE, '[]', 'utf8');

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.static(WEBSITE_DIR));

function readLogs() {
  try {
    return JSON.parse(fs.readFileSync(LOG_FILE, 'utf8'));
  } catch (error) {
    return [];
  }
}

function writeLogs(logs) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(logs.slice(-100000), null, 2), 'utf8');
}

app.post('/api/analytics/pageview', (req, res) => {
  const body = req.body || {};
  const now = new Date();
  const event = {
    type: body.type || 'page_view',
    visitorId: body.visitorId || 'unknown',
    path: body.path || '/',
    title: body.title || '',
    url: body.url || '',
    userAgent: body.userAgent || req.headers['user-agent'] || '',
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || '',
    timestamp: body.timestamp || now.toISOString(),
    month: body.month || now.toISOString().slice(0, 7),
    day: body.day || now.toISOString().slice(0, 10),
    receivedAt: now.toISOString()
  };

  const logs = readLogs();
  logs.push(event);
  writeLogs(logs);
  res.json({ ok: true, saved: true });
});

app.get('/api/analytics/monthly', (_req, res) => {
  const logs = readLogs();
  const grouped = {};

  logs.forEach((event) => {
    const month = event.month || String(event.timestamp || '').slice(0, 7) || 'unknown';
    if (!grouped[month]) {
      grouped[month] = {
        month,
        totalViews: 0,
        visitorIds: new Set(),
        firstVisit: event.timestamp,
        lastVisit: event.timestamp
      };
    }
    grouped[month].totalViews += 1;
    if (event.visitorId) grouped[month].visitorIds.add(event.visitorId);
    if (new Date(event.timestamp) < new Date(grouped[month].firstVisit)) grouped[month].firstVisit = event.timestamp;
    if (new Date(event.timestamp) > new Date(grouped[month].lastVisit)) grouped[month].lastVisit = event.timestamp;
  });

  const monthly = Object.values(grouped)
    .map(item => ({ ...item, uniqueVisitors: item.visitorIds.size, visitorIds: undefined }))
    .sort((a, b) => b.month.localeCompare(a.month));

  res.json({ ok: true, monthly, totalEvents: logs.length });
});

app.get('/health', (_req, res) => res.json({ ok: true, service: 'diluar-cost-analytics-backend' }));

app.listen(PORT, () => {
  console.log(`DILUAR COST website + analytics backend running on http://localhost:${PORT}`);
});
