# Veeboss Deployment Guide

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
npm --prefix server install
```

### 2. Start Both Frontend & Backend
```bash
npm run dev:all
```

Or run separately:
- Frontend: `npm run dev` (http://localhost:5173)
- Backend: `npm --prefix server run dev` (http://localhost:3001)

### 3. Test Admin Dashboard
1. Go to http://localhost:5173/admin
2. Enter passcode: `veeboss-admin`
3. Make changes and verify they sync within 5 seconds on the home page

---

## Deployment to a Hosted Backend

### Step 1: Deploy Backend to Railway

1. Go to https://railway.app and create a new project.
2. Connect your GitHub repository.
3. Set the service root to `server/`.
4. In Railway Environment Variables, add:
   - Name: `ADMIN_PASSCODE`
   - Value: `veeboss-admin`
   - Name: `STORAGE_PATH`
   - Value: `./content-store.json`
5. Deploy the project.
6. Copy the Railway backend URL (e.g., `https://veeboss-production.up.railway.app`).

> Note: The current backend stores content in a local JSON file. That works while the Railway instance is live, but for durable persistence use Supabase or another managed database.

---

### Alternative: Deploy Backend to Vercel

#### Option A: As Vercel Serverless Function
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click **Add New** → **Project**
4. Select your repository
5. In **Root Directory**, choose `server/`
6. Click **Environment Variables** and add:
   - Name: `ADMIN_PASSCODE`
   - Value: `veeboss-admin`
   - Name: `STORAGE_PATH`
   - Value: `/tmp/content-store.json` (Vercel uses `/tmp` for temporary files)
7. Click **Deploy** ✅
8. Copy the deployment URL (e.g., `https://veeboss-server-abc123.vercel.app`)

**Note:** On Vercel, each function restart resets `/tmp/content-store.json`. For persistent storage, consider:
- **PostgreSQL** (Vercel integrates with Neon)
- **MongoDB** (free tier available)
- **Supabase** (already in your code!)

---

### Step 2: Deploy Frontend to Vercel

1. In your main **Vercel project**, add **Environment Variables**:
   - Name: `VITE_API_BASE_URL`
   - Value: Your backend URL (Railway or Vercel, e.g. `https://veeboss-production.up.railway.app`)
   - Scope: Select `Production`

2. Redeploy frontend → Vercel auto-builds with new env vars

3. Test it:
   - Go to your frontend URL
   - Admin dashboard at `/admin` (passcode: `veeboss-admin`)
   - Make a change → should sync on home page within 5 seconds

---

## GitHub Push & Auto-Deploy

### 1. Connect GitHub to Vercel (Already Done)
- Both frontend and backend auto-deploy when you push to GitHub

### 2. Make Local Changes
```bash
# Make your changes
# Test locally
npm run dev:all

# Stage and commit
git add .
git commit -m "Update content or features"

# Push to GitHub
git push origin main
```

### 3. Auto-Deploy
- Vercel automatically rebuilds and deploys both services
- Check deployment status at vercel.com dashboard

---

## Workflow Summary

```
Local Changes
     ↓
npm run dev:all (test)
     ↓
git push
     ↓
Vercel auto-deploys frontend + backend
     ↓
Website updates with new API_BASE_URL
     ↓
Admin dashboard changes sync every 5 seconds ✨
```

---

## Troubleshooting

### Changes not syncing?
1. Check browser console for errors
2. Verify `VITE_API_BASE_URL` is set in Vercel
3. Check backend URL is reachable: `curl https://your-backend-url/api/content`

### Backend data resets after deploy?
- You're using `/tmp/` storage which is ephemeral on Vercel
- Solution: Use Supabase (already in code) or add a real database

### Polling not working?
1. Ensure backend is running
2. Check CORS is enabled (it is in `server/index.js`)
3. Browser console should show successful `/api/content/version` requests

---

## Next Steps (Optional)

### Use Supabase for Persistent Storage
1. Uncomment `VITE_SUPABASE_*` variables in `.env`
2. The code already uses Supabase if configured
3. Real-time updates are instant (no polling needed)

### Increase Polling Interval
Edit `src/App.tsx` line ~1790, change `5000` to `10000` (10 seconds)

---

## Need Help?
- Backend not starting? Check `PORT` in `server/.env`
- CORS errors? Verify backend is on same domain as frontend
- Content not persisting? Consider using Supabase or PostgreSQL
