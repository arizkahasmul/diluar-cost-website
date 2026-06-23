# DILUAR COST Website Analytics Setup

Website sudah disiapkan dengan 3 opsi analytics:

## 1. Google Analytics GA4
Buka `index.html`, cari:

```js
googleAnalyticsMeasurementId: 'G-XXXXXXXXXX'
```

Ganti dengan Measurement ID dari Google Analytics, contoh:

```js
googleAnalyticsMeasurementId: 'G-ABC1234567'
```

Setelah dihosting online, page view akan masuk ke Google Analytics.

## 2. Firebase Firestore
Buka `index.html`, cari bagian:

```js
firebase: {
  enabled: false,
  collectionName: 'website_page_views',
  config: { ... }
}
```

Ubah `enabled` menjadi `true`, lalu isi config Firebase dari Project Settings > Web App.

Data page view akan disimpan ke collection `website_page_views`.

## 3. Backend Database / Log Server
Masuk ke folder backend:

```bash
cd api-backend
npm install
npm start
```

Buka website dari:

```bash
http://localhost:3014
```

Endpoint tersedia:

```bash
POST /api/analytics/pageview
GET  /api/analytics/monthly
GET  /health
```

Data tersimpan di:

```bash
api-backend/data/pageviews.json
```

Untuk production, deploy backend ini ke VPS/Render/Railway/Vercel serverless/Cloud Run, lalu sesuaikan:

```js
backendEndpoint: 'https://domain-kamu.com/api/analytics/pageview'
```
