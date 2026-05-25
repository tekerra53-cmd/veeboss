# ⚡ Quick Start Guide

## Local Development

```bash
# 1. Install all dependencies
npm install
npm --prefix server install

# 2. Start everything
npm run dev:all
```

Open:
- **Frontend:** http://localhost:5173
- **Admin:** http://localhost:5173/admin (passcode: `veeboss-admin`)
- **API:** http://localhost:3001/api/content

---

## Deploy to Vercel

### Backend First (Important!)

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** → **Project** → Select your GitHub repo
3. **Root Directory:** Change to `server/`
4. **Environment Variables:**
   ```
   ADMIN_PASSCODE = veeboss-admin
   STORAGE_PATH = /tmp/content-store.json
   ```
5. **Deploy** and copy your backend URL (e.g., `https://veeboss-api-xyz.vercel.app`)

### Frontend After Backend

1. Go back to your frontend Vercel project
2. **Settings** → **Environment Variables**
3. Add/Update:
   ```
   VITE_API_BASE_URL = https://veeboss-api-xyz.vercel.app
   ```
4. **Redeploy**

---

## How It Works

✅ You make changes in admin dashboard  
✅ Changes saved to backend  
✅ Frontend polls backend every 5 seconds  
✅ Website updates automatically (no refresh needed!)  

---

## GitHub → Auto-Deploy

```bash
git add .
git commit -m "Update content"
git push origin main
```

Vercel automatically rebuilds both frontend and backend. Done! 🎉

---

## Files Created

- `.env` - Local development variables
- `.env.example` - Template for environment variables
- `.gitignore` - What to exclude from Git
- `vercel.json` - Frontend Vercel config
- `server/vercel.json` - Backend Vercel config
- `DEPLOYMENT.md` - Full deployment guide

---

## Troubleshooting

**Changes not syncing?**
- Verify `VITE_API_BASE_URL` is set in Vercel
- Check backend is running: `curl https://your-backend-url/api/content`

**Backend data lost after deploy?**
- Vercel's `/tmp` is temporary. Set up Supabase for persistent storage.
- See `DEPLOYMENT.md` for Supabase instructions.

---

## Next: Push to GitHub & Deploy

1. `git add .`
2. `git commit -m "Add real-time sync and deployment config"`
3. `git push origin main`
4. Visit Vercel dashboard and set environment variables
5. Done! Your site is live 🚀
