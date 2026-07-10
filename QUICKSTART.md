# 🚀 CivicAI Quick Start Guide

Get the app running in **5 minutes**.

---

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ MongoDB running (local or Atlas)
- ✅ OpenAI API key ([get one here](https://platform.openai.com/api-keys))
- ✅ Cloudinary account ([sign up free](https://cloudinary.com))
- ✅ Gmail account (for email notifications)

---

## 1️⃣ Configure Backend

Edit `server/.env`:

```env
# Required - MongoDB
MONGODB_URI=mongodb://localhost:27017/civicai

# Required - OpenAI (get from https://platform.openai.com/api-keys)
OPENAI_API_KEY=sk-your-key-here

# Required - Cloudinary (get from https://cloudinary.com/console)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Required - Email (use Gmail App Password: https://myaccount.google.com/apppasswords)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-16-char-app-password

# Optional - can leave as is
JWT_SECRET=civicai_super_secret_jwt_key_change_in_production
DUPLICATE_THRESHOLD=0.85
DUPLICATE_RADIUS_METERS=100
CLIENT_URL=http://localhost:5173
```

---

## 2️⃣ Start MongoDB

**Windows:**
```bash
mongod --dbpath "C:\data\db"
```

**Or use MongoDB Atlas (cloud):**
- Create free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
- Get connection string
- Update `MONGODB_URI` in `.env`

---

## 3️⃣ Install & Seed

```bash
# Backend
cd server
npm install
npm run seed

# Frontend
cd ../client
npm install
```

**Seed creates 3 test accounts:**
- 👤 Citizen: `citizen@civicai.com` / `citizen123`
- 👨‍💼 Authority: `authority@civicai.com` / `auth123`
- 👑 Admin: `admin@civicai.com` / `admin123`

---

## 4️⃣ Start Both Servers

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```
✅ Server: http://localhost:5000

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```
✅ Client: http://localhost:5173

---

## 5️⃣ Test the App

### As Citizen
1. Open http://localhost:5173
2. Login: `citizen@civicai.com` / `citizen123`
3. Click **"+ New Report"**
4. Upload a photo (any image)
5. Click **📍 GPS** to capture location (or enter manually)
6. Submit → Watch AI classify it! 🤖

### As Authority
1. Login: `authority@civicai.com` / `auth123`
2. View reports table (sorted by severity)
3. Toggle to **🗺️ Map** view → see heatmap
4. Click any report → update status, add notes

### As Admin
1. Login: `admin@civicai.com` / `admin123`
2. View analytics dashboard with charts
3. Filter by date range
4. Click **📥 Export CSV**

---

## 🎉 You're Done!

The app is now fully running with:
- ✅ AI classification (GPT-4o Vision)
- ✅ Severity estimation
- ✅ Duplicate detection (embeddings)
- ✅ Department routing
- ✅ Heatmap visualization
- ✅ Predictive analytics (runs daily at 2 AM)
- ✅ Email notifications
- ✅ Reputation scoring
- ✅ Offline support (IndexedDB)

---

## 🐛 Troubleshooting

### "MongoDB connection error"
- Start MongoDB: `mongod`
- Or use MongoDB Atlas connection string

### "OpenAI 401 Unauthorized"
- Check your API key is correct
- Verify you have credits: https://platform.openai.com/usage
- Key must start with `sk-`

### "Failed to upload image"
- Check Cloudinary credentials
- Test at: https://cloudinary.com/console
- Cloud name should NOT include https://

### "Email not sending"
- Use Gmail App Password (not regular password)
- Enable 2FA first
- Get app password: https://myaccount.google.com/apppasswords

### "Port 5000 already in use"
- Check what's using it: `netstat -ano | findstr :5000`
- Kill process: `taskkill /PID <process-id> /F`
- Or change PORT in `server/.env`

---

## 📚 More Info

- Full setup: `SETUP.md`
- Implementation status: `STATUS.md`
- Requirements: `.kiro/specs/civic-ai/requirements.md`
- Architecture: `.kiro/specs/civic-ai/design.md`
- Tasks completed: `.kiro/specs/civic-ai/tasks.md`

---

## 🎯 Next Steps

1. Upload real civic issue photos (potholes, streetlights, etc.)
2. Test duplicate detection with similar images
3. Review AI classification accuracy
4. Check heatmap with multiple reports
5. Test offline mode (disable network, create report, re-enable)

---

**Need Help?** Check the README.md or SETUP.md for detailed guides.

**Built with:** React • Node.js • MongoDB • OpenAI • Cloudinary • Leaflet 🚀
