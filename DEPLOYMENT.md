# Veeboss Deployment Guide

## Local Development Setup

### 1. Create and activate a virtual environment
```powershell
python -m venv .venv
.\.venv\Scripts\Activate
```

### 2. Install dependencies
```powershell
pip install -r requirements.txt
```

### 3. Run the app locally
```powershell
python app.py
```

Then open `http://127.0.0.1:5000` in your browser.

### 4. Verify the admin page
- Visit `http://127.0.0.1:5000/admin`
- Passcode: `veeboss-admin`

---

## Production Deployment Flow

This repository is a Flask application with templates under `templates/` and static assets served from `public/`.

### Recommended production server
For deployment on a Linux host, use a WSGI server such as `gunicorn`.

```powershell
pip install gunicorn
gunicorn app:app
```

If you deploy on Windows, use a production-ready server such as `waitress` instead.

---

## Deploying to Render

1. Create a new Web Service on https://render.com.
2. Connect your GitHub repository.
3. Set the **Root Directory** to the repo root.
4. Set the **Build Command** to:
   ```bash
   pip install -r requirements.txt
   ```
5. Set the **Start Command** to:
   ```bash
   gunicorn app:app
   ```
6. Add any environment variables if needed.
7. Deploy.

> Note: The site currently uses a hard-coded `app.secret_key` in `app.py`. Replace this with a secure value before deploying to production.

---

## Deploying to Railway

1. Create a new project on https://railway.app.
2. Connect your GitHub repository.
3. Set the service root to the repository root.
4. Set the start command to:
   ```bash
   gunicorn app:app
   ```
5. Add environment variables if you decide to make the secret configurable.
6. Deploy.

---

## Deploying to Heroku

1. Create a `Procfile` in the repo root with:
   ```text
   web: gunicorn app:app
   ```
2. Commit and push the file.
3. Create a Heroku app and connect your repository.
4. Deploy from GitHub or push directly.

---

## Environment and Secrets

The current app uses the following values by default:
- `ADMIN_PASSCODE = "veeboss-admin"`
- `SECRET_KEY = "replace-this-with-a-secure-secret"`

For production, override these as environment variables and use a strong random secret.

### Supabase persistence

To keep admin changes across Railway and Vercel deployments, configure Supabase and set these backend-only env vars:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Optionally override the default admin passcode:
- `ADMIN_PASSCODE`

Optional Flask session secret:
- `SECRET_KEY`

### Supabase table setup

Use the Supabase SQL editor to create the persistence table:
```sql
create table if not exists site_content (
  id text primary key,
  content jsonb not null
);

insert into site_content (id, content)
values ('site', '{}')
on conflict (id) do nothing;
```

When Supabase is configured, the app will save content there. Otherwise it falls back to a local `content.json` file.

### Configuring environment variables on Railway and Vercel

- Railway: In your project settings, add two environment variables under "Variables": `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Mark the service role key as hidden. Redeploy the service after saving.

- Vercel: Go to your Project Settings → Environment Variables and add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. For `Environment`, choose "Production" (and optionally "Preview" if you want previews to use Supabase). Set the scope to "Secret" for the service role key. Redeploy the project.

Important: Use the Supabase Service Role Key only on secure server-side environments. Do NOT expose it to client-side code or public repositories.

### Seeding from the SQL file

You can run the file at `sql/create_site_content.sql` in the Supabase SQL editor to create the table and insert an initial row with `id = 'site'` which matches the app's expectations.

Alternatively, use the provided seeding helper script which can upsert JSON from `content.json` or a specified file:

```bash
# Dry run (prints content without contacting Supabase)
python scripts/seed_supabase.py --dry-run

# Seed using local content.json or a provided file
SUPABASE_URL="https://xyz.supabase.co" SUPABASE_SERVICE_ROLE_KEY="<service-role-key>" \
   python scripts/seed_supabase.py --file content.json
```

---

## Deployment Checklist

1. Test locally:
   ```powershell
   python app.py
   ```
2. Confirm `/admin` works with `veeboss-admin`.
3. Replace the hard-coded secret before production.
4. Push code to GitHub.
5. Deploy with `gunicorn app:app` on your chosen host.
6. Open the public URL and verify the site loads.

---

## Troubleshooting

### App does not start
- Ensure the virtual environment is activated.
- Confirm `Flask==2.3.4` is installed.
- Run `python app.py` and inspect the terminal output.

### Admin page fails to load
- Verify the passcode is `veeboss-admin`.
- Check that `session` is enabled and cookies are accepted by your browser.

### Production deployment returns 500
- Confirm your host runs `gunicorn app:app`.
- Replace `app.secret_key` with a secure value if required by your platform.

---

## Notes

- This project is a single Flask app, not a separate frontend/backend repo.
- Static files are served from `public/` via Flask.
- The app uses Jinja templates in `templates/`.
