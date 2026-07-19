# CivicAI Deployment Guide

## Option 1 — Render.com (Recommended, Free Tier)

### Step 1: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/civicai.git
git push -u origin main
```

### Step 2: Deploy Backend on Render
1. Go to https://render.com → **New → Web Service**
2. Connect your GitHub repo
3. Settings:
   - **Root Directory:** `server`
   - **Build Command:** `npm install`
   - **Start Command:** `node src/index.js`
   - **Environment:** `Node`
4. Add Environment Variables (from your `.env`):
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URI` | Your Atlas connection string |
   | `JWT_SECRET` | Any random 64-char string |
   | `REFRESH_TOKEN_SECRET` | Any random 64-char string |
   | `OPENAI_API_KEY` | `sk-...` |
   | `CLOUDINARY_CLOUD_NAME` | Your cloud name |
   | `CLOUDINARY_API_KEY` | Your API key |
   | `CLOUDINARY_API_SECRET` | Your secret |
   | `SMTP_HOST` | `smtp.gmail.com` |
   | `SMTP_PORT` | `587` |
   | `SMTP_USER` | Your Gmail |
   | `SMTP_PASS` | Your App Password |
   | `CLIENT_URL` | Your Render frontend URL (add after deploying frontend) |

5. Click **Deploy** → Note the URL e.g. `https://civicai-server.onrender.com`

### Step 3: Deploy Frontend on Render
1. **New → Static Site**
2. Connect same GitHub repo
3. Settings:
   - **Root Directory:** `client`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add Environment Variable:
   | Key | Value |
   |-----|-------|
   | `VITE_API_BASE_URL` | `https://civicai-server.onrender.com/api` |
5. Click **Deploy**

### Step 4: Seed the database
```bash
# On your local machine, point to Atlas and run:
cd server
MONGODB_URI=your_atlas_uri node src/utils/seed.js
```

---

## Option 2 — Railway.app

### Backend
1. Go to https://railway.app → **New Project → Deploy from GitHub**
2. Select your repo → choose `server` folder
3. Add environment variables (same as Render above)
4. Railway auto-detects Node.js and deploys

### Frontend
1. **New Service → GitHub Repo** → choose `client` folder
2. Set build: `npm run build`, output: `dist`
3. Set `VITE_API_BASE_URL` to your Railway backend URL

---

## Option 3 — Docker (Self-hosted / VPS)

### Prerequisites
- Docker & Docker Compose installed
- A server (DigitalOcean, AWS EC2, etc.)

### Steps
```bash
# 1. Clone repo on your server
git clone https://github.com/YOUR_USERNAME/civicai.git
cd civicai

# 2. Create .env file
cp server/.env.example server/.env
# Edit server/.env with your real values

# 3. Build and run
docker-compose up -d --build

# 4. Seed database
docker exec civicai-server node src/utils/seed.js

# 5. Check status
docker-compose ps
docker-compose logs server
```

App runs at `http://YOUR_SERVER_IP:3000`

---

## MongoDB Atlas Setup (Required for cloud deployment)

1. Go to https://www.mongodb.com/atlas
2. Create free cluster (M0)
3. **Database Access** → Add user: `civicai_user` with password
4. **Network Access** → Allow `0.0.0.0/0` (all IPs) for cloud deploy
5. **Connect** → Copy connection string:
   ```
   mongodb+srv://civicai_user:PASSWORD@cluster0.xxxxx.mongodb.net/civicai?retryWrites=true&w=majority
   ```
6. Use this as `MONGODB_URI`

---

## Current Status

| Service | Local | Deployed |
|---------|-------|----------|
| Frontend | ✅ http://localhost:5173 | Pending |
| Backend  | ✅ http://localhost:5000 | Pending |
| MongoDB  | ✅ localhost:27017 | Pending |

## Test Accounts (after seeding)
| Role | Email | Password |
|------|-------|----------|
| Citizen | citizen@civicai.com | citizen123 |
| Authority | authority@civicai.com | auth123 |
| Admin | admin@civicai.com | admin123 |
