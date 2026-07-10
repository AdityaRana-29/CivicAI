# 🚀 CivicAI Setup Guide

## Step-by-Step Setup Instructions

### 1. Install MongoDB (if not already installed)

**Windows:**
```bash
# Download from: https://www.mongodb.com/try/download/community
# Or use MongoDB Atlas (cloud): https://www.mongodb.com/atlas
```

**Start MongoDB locally:**
```bash
mongod --dbpath "C:\data\db"
```

### 2. Get API Keys

**OpenAI API Key:**
1. Go to https://platform.openai.com/
2. Sign up / log in
3. Navigate to API Keys section
4. Create new secret key
5. Copy the key (starts with `sk-...`)

**Cloudinary Account:**
1. Go to https://cloudinary.com/
2. Sign up for free
3. Get your credentials from dashboard:
   - Cloud Name
   - API Key
   - API Secret

**SMTP Email (Gmail example):**
1. Enable 2FA on your Google account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an App Password
4. Copy the 16-character password

### 3. Configure Backend

```bash
cd server
```

Edit `.env` file with your credentials:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/civicai
JWT_SECRET=your_random_secret_here_change_me
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=another_random_secret_change_me
REFRESH_TOKEN_EXPIRES_IN=7d

OPENAI_API_KEY=sk-your-openai-key-here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password

DUPLICATE_THRESHOLD=0.85
DUPLICATE_RADIUS_METERS=100
PREDICTION_MIN_CLUSTER_SIZE=5

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### 4. Start Backend

```bash
cd server

# Install dependencies (already done)
# npm install

# Seed database with test users
npm run seed

# Start server
npm run dev
```

You should see:
```
✅ CivicAI Server running on http://localhost:5000
MongoDB Connected: localhost
```

**Test the API:**
Open http://localhost:5000/health in your browser. You should see:
```json
{"success":true,"message":"CivicAI API is running"}
```

### 5. Start Frontend

Open a new terminal:

```bash
cd client

# Install dependencies (already done)
# npm install

# Start dev server
npm run dev
```

You should see:
```
VITE ready in X ms
➜  Local:   http://localhost:5173/
```

### 6. Test the Application

1. Open http://localhost:5173 in your browser

2. **Login with test accounts:**
   - Citizen: `citizen@civicai.com` / `citizen123`
   - Authority: `authority@civicai.com` / `auth123`
   - Admin: `admin@civicai.com` / `admin123`

3. **As a Citizen:**
   - Click "Report Issue"
   - Upload a test photo (any image)
   - Click "📍 GPS" to capture location (or enter manually)
   - Submit report
   - Watch AI process it (classification, severity, department routing)

4. **As an Authority:**
   - View all reports in your department
   - Update report status
   - (Heatmap coming in next implementation phase)

5. **As an Admin:**
   - View analytics (charts/trends coming in next phase)

## 🔧 Troubleshooting

### MongoDB Connection Error

**Error:** `MongoDB connection error: connect ECONNREFUSED`

**Fix:**
- Make sure MongoDB is running: `mongod`
- Or update `MONGODB_URI` to use MongoDB Atlas connection string

### OpenAI API Error

**Error:** `401 Unauthorized` in AI classification

**Fix:**
- Verify your `OPENAI_API_KEY` is valid
- Check you have credits: https://platform.openai.com/usage
- Make sure the key starts with `sk-`

### Cloudinary Upload Error

**Error:** `Failed to upload image`

**Fix:**
- Verify Cloudinary credentials in `.env`
- Check cloud name (no https://, just the name)
- Test upload at https://cloudinary.com/console

### Email Notifications Not Working

**Fix:**
- Use Gmail App Password (not your regular password)
- Enable "Less secure app access" if using regular password
- Check SMTP settings match your provider

### Port Already in Use

**Error:** `EADDRINUSE: address already in use :::5000`

**Fix:**
```bash
# Windows:
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Or change PORT in server/.env to 5001
```

## 📊 Database Seeded Data

After running `npm run seed`, you get:

**6 Departments:**
- Roads & Infrastructure (pothole, damaged_road)
- Electrical (broken_streetlight)
- Waste Management (overflowing_garbage)
- Parks & Environment (fallen_tree)
- Water & Utilities (water_leakage)
- General (other)

**3 Test Users:**
| Role          | Email                  | Password    |
|---------------|------------------------|-------------|
| Citizen       | citizen@civicai.com    | citizen123  |
| Authority     | authority@civicai.com  | auth123     |
| Administrator | admin@civicai.com      | admin123    |

## 🎯 Next Steps

Once everything is running:

1. **Create test reports** as a citizen
2. **Update report statuses** as an authority
3. **View analytics** as an admin
4. **Check the spec files** in `.kiro/specs/civic-ai/` to see:
   - `requirements.md` — All 15 requirements
   - `design.md` — Full architecture
   - `tasks.md` — Implementation roadmap

## 🚧 Work In Progress

The following features are stubbed but need full implementation:

- **Authority Heatmap** (Task 13) — Leaflet map with heatmap.js overlay
- **Admin Analytics Charts** (Task 17) — Recharts bar/line charts
- **Offline Sync UI** (Task 15) — Banner showing pending reports
- **Prediction Overlay** (Task 14.6) — Risk clusters on map

See `tasks.md` for details on completing these tasks.

## ✅ What's Working Now

- ✅ User registration & authentication
- ✅ Citizen report submission
- ✅ AI classification (GPT-4o Vision)
- ✅ Severity estimation
- ✅ Department routing
- ✅ Duplicate detection (embeddings + cosine similarity)
- ✅ AI summarization
- ✅ Email & in-app notifications
- ✅ Reputation scoring
- ✅ Status tracking & history
- ✅ Report filtering (backend ready)
- ✅ Prediction engine (cron job)
- ✅ Analytics API (summary, performance, trends, CSV)

## 🎓 Learning Resources

- **OpenAI Vision API:** https://platform.openai.com/docs/guides/vision
- **MongoDB GeoJSON:** https://www.mongodb.com/docs/manual/geospatial-queries/
- **React Leaflet:** https://react-leaflet.js.org/
- **Recharts:** https://recharts.org/

---

**Need help?** Check the README.md or the spec files in `.kiro/specs/civic-ai/`
