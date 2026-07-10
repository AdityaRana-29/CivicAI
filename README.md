# CivicAI – AI-Powered Public Issue Reporting Platform

A full-stack platform enabling citizens to report civic infrastructure issues (potholes, streetlights, garbage, etc.) with AI-powered classification, duplicate detection, and municipal dashboards.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- OpenAI API key
- Cloudinary account (image storage)
- SMTP credentials (email notifications)

### 1. Clone and Install

```bash
cd CivicAI
```

### 2. Backend Setup

```bash
cd server
npm install
```

Edit `server/.env` with your credentials:
```
MONGODB_URI=mongodb://localhost:27017/civicai
OPENAI_API_KEY=your_openai_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

Seed the database:
```bash
npm run seed
```

**Test accounts created:**
- Admin: `admin@civicai.com` / `admin123`
- Authority: `authority@civicai.com` / `auth123`
- Citizen: `citizen@civicai.com` / `citizen123`

Start the server:
```bash
npm run dev
```

Server runs on http://localhost:5000

### 3. Frontend Setup

```bash
cd ../client
npm install
npm run dev
```

Client runs on http://localhost:5173

## 🏗️ Architecture

**Backend (Node.js + Express)**
- Auth with JWT & role-based access
- Report submission with multipart upload
- AI pipeline: Classification → Severity → Department routing → Duplicate detection → Summarization
- Cron job for predictive analytics (runs daily)

**Frontend (React + Tailwind)**
- Citizen: Submit reports, track status
- Authority: Dashboard with filters, heatmap, status updates
- Admin: Analytics charts, trends, CSV export
- Offline support: IndexedDB queue + auto-sync

**AI/ML Services**
- GPT-4o Vision for image classification & severity
- OpenAI Embeddings for duplicate detection (cosine similarity)
- GPT-4o for report summarization

**Database (MongoDB)**
- 5 models: User, Report, Department, Prediction, Notification
- GeoJSON + 2dsphere indexes for spatial queries

## 📁 Project Structure

```
CivicAI/
├── server/
│   ├── src/
│   │   ├── config/        # DB & Cloudinary setup
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routes
│   │   ├── controllers/   # Request handlers
│   │   ├── services/      # AI, notifications, predictions
│   │   ├── middleware/    # Auth, upload, errors
│   │   └── utils/         # Seed script
│   └── .env
│
├── client/
│   ├── src/
│   │   ├── pages/         # Login, dashboards, forms
│   │   ├── components/    # Navbar, badges, etc
│   │   ├── context/       # Auth context
│   │   ├── services/      # API client, offline storage
│   │   └── main.jsx
│   └── index.html
│
└── .kiro/
    └── specs/
        └── civic-ai/
            ├── requirements.md  # 15 EARS requirements
            ├── design.md        # Full system design
            └── tasks.md         # 20 implementation tasks
```

## 🧪 Testing the Full Flow

1. **Citizen registers** at `/register`
2. **Submit a report** → Upload photo + capture GPS
3. **AI processes** → Classifies issue type, estimates severity, suggests department
4. **Duplicate detector** → Compares with existing reports using embeddings
5. **Notification sent** → Email + in-app
6. **Authority logs in** → Sees report in dashboard, can update status
7. **Admin views analytics** → Charts, trends, CSV export

## 🔑 API Endpoints

### Auth
- `POST /api/auth/register` — Register new user
- `POST /api/auth/login` — Login & get JWT
- `GET /api/auth/me` — Get current user

### Reports
- `POST /api/reports` — Submit report (multipart)
- `GET /api/reports/mine` — Citizen's reports
- `GET /api/reports` — Authority: list with filters
- `GET /api/reports/:id` — Report details
- `PATCH /api/reports/:id/status` — Update status
- `PATCH /api/reports/:id/reassign` — Reassign department
- `PATCH /api/reports/:id/flag` — Mark as spam

### Analytics (Admin)
- `GET /api/analytics/summary` — Report counts by type/severity
- `GET /api/analytics/performance` — Avg resolution time per dept
- `GET /api/analytics/trends` — Time-series submission volume
- `GET /api/analytics/export` — CSV download

### Predictions
- `GET /api/predictions` — Get prediction clusters
- `POST /api/predictions/run` — Manual trigger

## 🛠️ Next Steps (See `tasks.md` for full list)

**Completed:**
✅ Task 1–3: Scaffolding, models, auth
✅ Task 4–9: Reports, AI services, duplicate detection
✅ Task 10–17: Tracking, notifications, reputation, predictions, analytics
✅ Task 18: Basic frontend (login, citizen dashboard, report submission)

**Remaining:**
- Task 12.4–12.5: Authority dashboard with heatmap + filters
- Task 13: Full heatmap with Leaflet + react-leaflet + leaflet.heat
- Task 17.5–17.7: Admin analytics charts with Recharts
- Task 15: Full offline sync implementation
- Task 19: Enhanced error boundaries & input validation
- Task 20: Final integration testing

## 🚦 Current Status

**Backend:** ✅ Fully functional
- All API routes implemented
- AI pipeline working
- Prediction engine with cron job
- Notifications (in-app + email)
- Reputation scoring

**Frontend:** 🟡 Core features implemented
- Login/Register ✅
- Citizen dashboard & report submission ✅
- Report detail view ✅
- Authority & Admin dashboards (stub pages, need heatmap + charts)

## 📝 Environment Variables Reference

See `server/.env` for full list. Key variables:
- `OPENAI_API_KEY` — Required for AI classification, severity, embeddings, summarization
- `CLOUDINARY_*` — Required for image upload
- `SMTP_*` — Required for email notifications
- `DUPLICATE_THRESHOLD` — Cosine similarity threshold (default 0.85)
- `DUPLICATE_RADIUS_METERS` — Geographic radius for duplicate detection (default 100m)

## 🤝 Contributing

1. Read `.kiro/specs/civic-ai/requirements.md` for feature requirements
2. Check `.kiro/specs/civic-ai/design.md` for architecture
3. Pick a task from `.kiro/specs/civic-ai/tasks.md`
4. Implement & test
5. Submit PR

## 📄 License

MIT

---

Built with ❤️ for smarter civic infrastructure management.
