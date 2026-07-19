# 🏙️ CivicAI — AI-Powered Public Issue Reporting Platform

<div align="center">

![CivicAI](https://img.shields.io/badge/CivicAI-Live-brightgreen?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o-412991?style=for-the-badge&logo=openai)

### 🌐 [Live Demo](https://civicai-12.vercel.app)

**Demo Accounts:**
`citizen@civicai.com` / `citizen123` &nbsp;|&nbsp;
`authority@civicai.com` / `auth123` &nbsp;|&nbsp;
`admin@civicai.com` / `admin123`

</div>

---

## 📌 What is CivicAI?

CivicAI lets citizens **report potholes, broken streetlights, garbage overflow, water leakage** and other public infrastructure issues by simply uploading a photo and location. AI does the rest.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| 📸 **Photo Upload** | Upload or drag-and-drop issue photos |
| 🤖 **AI Classification** | GPT-4o Vision auto-detects issue type & severity |
| 🗺️ **Heatmap** | Leaflet map with real-time issue density overlay |
| 🔁 **Duplicate Detection** | Embeddings + cosine similarity merge duplicate reports |
| 📊 **Analytics Dashboard** | Charts for trends, resolution time, department performance |
| 🔔 **Notifications** | Email + in-app alerts on status changes |
| ⭐ **Reputation Scoring** | Citizen score to reduce spam reports |
| 📡 **Offline Support** | IndexedDB queue — sync reports when back online |
| 🔮 **Predictive Analysis** | Daily cron identifies high-risk recurring areas |

---

## 🛠️ Tech Stack

**Frontend** → React 19 + Vite + Tailwind CSS + Recharts + Leaflet  
**Backend** → Node.js + Express + MongoDB Atlas + Mongoose  
**AI/ML** → OpenAI GPT-4o Vision + text-embedding-3-small  
**Storage** → Cloudinary (CDN image delivery)  
**Auth** → JWT + bcrypt + role-based access control  
**Deploy** → Vercel (frontend) + Render (backend) + MongoDB Atlas

---

## 👥 User Roles

```
Citizen      →  Submit & track reports
Authority    →  Manage, update status, view heatmap
Administrator → Full analytics, CSV export, predictions
```

---

## 🚀 Run Locally

### Prerequisites
- Node.js 18+, MongoDB, OpenAI API key, Cloudinary account

### 1. Clone
```bash
git clone https://github.com/AdityaRana-29/CivicAI.git
cd CivicAI
```

### 2. Backend
```bash
cd server
npm install
cp .env.example .env   # fill in your keys
npm run seed           # creates test accounts
npm run dev            # starts on :5000
```

### 3. Frontend
```bash
cd client
npm install
npm run dev            # starts on :5173
```

### 4. Open
```
http://localhost:5173
```

---

## 🔑 Environment Variables

See `server/.env.example` for the full list. Required keys:

```env
MONGODB_URI=your_mongodb_atlas_uri
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

---

## 📁 Project Structure

```
CivicAI/
├── client/                 # React frontend
│   └── src/
│       ├── pages/          # Login, Dashboards, CreateReport, ReportDetail
│       ├── components/     # Navbar, HeatmapView, ReportTable, StatusBadge
│       ├── services/       # API client, offline storage
│       └── context/        # Auth context
│
├── server/                 # Node.js backend
│   └── src/
│       ├── models/         # User, Report, Department, Prediction, Notification
│       ├── controllers/    # Auth, Reports, Heatmap, Analytics, Predictions
│       ├── services/       # OpenAI, Cloudinary, Duplicate Detection, Email
│       └── routes/         # All API routes
│
└── .kiro/specs/civic-ai/   # Requirements, design, tasks docs
```

---

## � API Endpoints

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/reports/mine          (citizen)
POST   /api/reports               (submit with photo)
GET    /api/reports               (authority - with filters)
PATCH  /api/reports/:id/status    (authority)
GET    /api/heatmap/data
GET    /api/predictions
GET    /api/analytics/summary     (admin)
GET    /api/analytics/export      (CSV download)
```

---

## 📸 Screenshots

> Login → Citizen Dashboard → Submit Report → Authority Heatmap → Admin Analytics

---

## � License

MIT © [Aditya Rana](https://github.com/AdityaRana-29)
