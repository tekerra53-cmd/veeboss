# Veeboss Backend

This folder contains the Express backend for the Veeboss admin API.

## Run locally

```bash
cd server
npm install
npm run dev
```

Backend API:
- `GET /api/content`
- `GET /api/content/version`
- `POST /api/content`

## Environment variables

- `ADMIN_PASSCODE` - admin unlock code for saving content (defaults to `veeboss-admin`)
- `STORAGE_PATH` - path to the JSON content store (defaults to `./content-store.json`)

## Deploying to Railway

1. Create a new Railway project.
2. Connect the repository.
3. Set the service root to `server/`.
4. Add these environment variables:
   - `ADMIN_PASSCODE = veeboss-admin`
   - `STORAGE_PATH = ./content-store.json`
5. Railway will deploy the backend and provide a public URL.
6. Use that URL as `VITE_API_BASE_URL` in your frontend deployment.

> Note: This backend currently saves content to a local JSON file. For production durability, use Supabase or a managed database instead.
