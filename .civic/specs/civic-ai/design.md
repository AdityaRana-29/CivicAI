# Design Document

## Overview

CivicAI is a full-stack AI-powered civic issue reporting platform. The architecture follows a layered monorepo structure with a React/Tailwind frontend, a Node.js/Express REST API backend, MongoDB for persistence, and a set of AI/ML service modules for classification, duplicate detection, severity estimation, and summarisation. Cloud image storage (Cloudinary) serves photos via CDN. Leaflet.js handles all map rendering.

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Frontend (React)                 │
│  Citizen App  │  Authority Dashboard  │  Admin Panel │
└──────────────────────────┬──────────────────────────┘
                           │ REST / JSON
┌──────────────────────────▼──────────────────────────┐
│              Backend (Node.js + Express)             │
│  Auth  │  Reports  │  AI Services  │  Notifications │
└──────┬───────────────────────────────────┬──────────┘
       │                                   │
┌──────▼──────┐                 ┌──────────▼──────────┐
│   MongoDB   │                 │   Cloudinary (S3)   │
│  (Mongoose) │                 │   Image Storage     │
└─────────────┘                 └─────────────────────┘
       │
┌──────▼──────────────────────────────────────────────┐
│              AI/ML Service Layer                    │
│  Classifier  │  Severity  │  Embeddings  │  LLM    │
│  (OpenAI     │  Estimator │  (duplicate) │  (GPT)  │
│   Vision)    │            │              │         │
└─────────────────────────────────────────────────────┘
```

---

## Data Models

### User
```js
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  passwordHash: String,
  role: Enum ['citizen', 'authority', 'administrator'],
  department: ObjectId (ref: Department, authority only),
  reputationScore: Number (default: 50, min: 0, max: 100),
  failedLoginAttempts: Number (default: 0),
  isLocked: Boolean (default: false),
  notificationEmail: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Report
```js
{
  _id: ObjectId,
  submittedBy: ObjectId (ref: User),
  photoUrl: String,
  photoEmbedding: [Number],       // vector for duplicate detection
  location: {
    type: 'Point',
    coordinates: [longitude, latitude]  // GeoJSON
  },
  address: String (reverse geocoded),
  issueType: Enum ['pothole', 'broken_streetlight', 'overflowing_garbage',
                   'fallen_tree', 'water_leakage', 'damaged_road', 'other'],
  classificationConfidence: Number,
  severityLevel: Enum ['low', 'medium', 'high', 'critical'],
  department: ObjectId (ref: Department),
  status: Enum ['submitted', 'under_review', 'in_progress', 'resolved', 'closed'],
  statusHistory: [{
    status: String,
    changedBy: ObjectId (ref: User),
    changedAt: Date,
    notes: String
  }],
  aiSummary: String,
  isDuplicate: Boolean (default: false),
  duplicateOf: ObjectId (ref: Report),
  duplicateCount: Number (default: 0),
  resolvedAt: Date,
  resolutionNotes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Department
```js
{
  _id: ObjectId,
  name: String,
  issueTypes: [String],   // which issue types route here
  jurisdictionBounds: GeoJSON Polygon (optional),
  createdAt: Date
}
```

### Prediction
```js
{
  _id: ObjectId,
  centroid: { type: 'Point', coordinates: [lon, lat] },
  dominantIssueType: String,
  recurrenceCount: Number,
  riskRating: Enum ['medium', 'high'],
  windowStart: Date,
  windowEnd: Date,
  generatedAt: Date
}
```

---

## Component Design

### Backend – Express Route Structure

```
/api
  /auth
    POST /register
    POST /login
    POST /logout
  /reports
    POST /                     → submit report (citizen)
    GET  /                     → list reports (authority/admin, with filters)
    GET  /:id                  → get single report
    PATCH /:id/status          → update status (authority)
    PATCH /:id/reassign        → reassign department (authority)
    GET  /mine                 → citizen's own reports
  /ai
    POST /classify             → run classifier on image
    POST /summarise            → generate LLM summary
  /heatmap
    GET  /data                 → aggregated geo data for heatmap
  /predictions
    GET  /                     → get current prediction records
  /analytics
    GET  /summary              → report counts by type/severity
    GET  /performance          → avg resolution time per dept
    GET  /trends               → time-series submission volume
    GET  /export               → CSV download
  /users
    GET  /:id/reputation       → get citizen reputation
  /notifications
    GET  /mine                 → citizen's notifications
```

### Middleware Stack
- `helmet` – security headers
- `express-rate-limit` – brute-force protection on `/api/auth`
- `multer` + `sharp` – multipart file handling and image pre-processing
- `authMiddleware` – JWT verification on all protected routes
- `roleGuard(roles[])` – role-based access control per route
- `asyncHandler` – centralised async error catching

---

## AI/ML Service Layer

### Classifier (`services/classifier.js`)
- Sends the image URL to OpenAI GPT-4o Vision with a structured prompt requesting `{ issueType, confidence }`.
- Returns a JSON response with `issueType` from the taxonomy and `confidence` (0–1).
- Falls back to `"other"` with confidence `0.0` on API error.

### Severity Estimator (`services/severityEstimator.js`)
- Second Vision API call (or same call) with prompt: "Given this infrastructure issue image and type, rate severity as low/medium/high/critical with reasoning."
- Returns `{ severityLevel, reasoning }`.

### Embedding Generator (`services/embeddingService.js`)
- Uses OpenAI `text-embedding-3-small` on a text description of the image (from classification output) to generate a 1536-dimension vector.
- Stored in Report document as `photoEmbedding`.
- For duplicate detection: cosine similarity computed in-application over candidates pre-filtered by MongoDB `$geoNear` (100m radius).

### Report Summariser (`services/summariser.js`)
- Calls GPT-4o with: issue type, severity, address, and any citizen-provided description.
- Prompt enforces ≤100 word plain-language output.

### Prediction Engine (`services/predictionEngine.js`)
- Cron job (node-cron, daily at 02:00).
- Queries Reports from the past 90 days, groups by `issueType` + geographic cluster (using MongoDB `$geoNear` + aggregation).
- Clusters with ≥5 occurrences in a 500m radius → medium risk; ≥10 → high risk.
- Writes Prediction documents, replacing previous run's records.

---

## Frontend Architecture

### Pages & Routing
```
/                    → Landing / Login
/register            → Citizen registration
/dashboard           → Citizen dashboard (my reports)
/report/new          → Submit new report
/report/:id          → Report detail (citizen view)
/authority           → Authority dashboard
/authority/:id       → Report management view
/admin               → Analytics dashboard (admin only)
```

### Key Components

| Component | Description |
|---|---|
| `ReportForm` | Multi-step form: photo upload → GPS capture → issue type confirmation → submit |
| `IssueMap` | Leaflet map with heatmap layer (leaflet.heat), marker clusters, filter panel |
| `ReportCard` | Summary card for report list views, shows severity badge + reputation score |
| `StatusTimeline` | Visualises status history with timestamps |
| `HeatmapLayer` | Renders heatmap overlay and prediction cluster overlay |
| `AnalyticsPanel` | Charts (Recharts) for trends, resolution times, type breakdown |
| `OfflineBanner` | Shows pending offline report count; auto-syncs on reconnect |
| `AuthContext` | React context for JWT, role, and user state |

### State Management
- React Context for auth state.
- React Query (`@tanstack/react-query`) for server state, caching, and background refetch (60s interval for map data).
- `localStorage` / IndexedDB for offline report queue.

### Offline Support
- Service Worker (via Workbox) intercepts report submissions when offline.
- Stores pending reports in IndexedDB.
- Background sync triggered when `navigator.onLine` becomes `true`.
- `OfflineBanner` component reads from IndexedDB to show pending count.

---

## Authentication & Security

- Passwords hashed with `bcrypt` (12 rounds).
- JWT signed with `RS256` (asymmetric), 24h expiry.
- Refresh token (7 days) stored in `httpOnly` cookie.
- Rate limiting: 10 requests/15 min on `/api/auth/login`.
- Account lockout after 5 failed attempts; unlock email sent via Nodemailer.
- All S3/Cloudinary URLs are signed (pre-signed URLs, 1h expiry for retrieval).

---

## Notifications

- In-app: stored as Notification documents in MongoDB, polled by frontend every 30s.
- Email: Nodemailer with SMTP (configurable). Sent on status change events via an event-emitter pattern (`EventEmitter` → `notificationService.sendEmail()`).

---

## Image Storage (Cloudinary)

- Upload via Cloudinary Node SDK on backend after Multer parses the multipart form.
- Retry logic: up to 3 attempts with exponential backoff.
- Stored in folder `civicai/reports/`.
- CDN URL returned and saved to `report.photoUrl`.
- Image compressed to JPEG quality 85 (preserves detail for AI; reduces storage cost).

---

## Maps Integration (Leaflet.js)

- `react-leaflet` for map rendering.
- `leaflet.heat` plugin for heatmap overlays.
- `leaflet.markercluster` for clustered issue pins.
- GeoJSON `Point` coordinates stored in MongoDB; `2dsphere` index on `location` field.
- Prediction Engine centroids rendered as a separate semi-transparent circle overlay layer.

---

## Error Handling Strategy

- All async route handlers wrapped in `asyncHandler` utility.
- Centralised Express error middleware returns consistent `{ success: false, error: { code, message } }` JSON.
- Frontend: React Query error boundaries surface user-facing toasts via `react-hot-toast`.

---

## Environment Configuration

```
# Server
PORT=5000
MONGODB_URI=mongodb://...
JWT_PRIVATE_KEY=...
JWT_PUBLIC_KEY=...
OPENAI_API_KEY=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
DUPLICATE_THRESHOLD=0.85
DUPLICATE_RADIUS_METERS=100
PREDICTION_MIN_CLUSTER_SIZE=5

# Client
VITE_API_BASE_URL=http://localhost:5000/api
VITE_MAPBOX_TOKEN=...  (or leave empty for OSM tiles)
```
