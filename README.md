# Dei Frati Restaurant

Full‑stack restaurant web app with a public site (home/menu/reservations/contact) and an admin area to manage menu items and wines.

## Structure

- `frontend/` — React + TypeScript (Vite)
- `backend/` — Node.js (Express) API + MySQL

## Key features

- Public pages: menu (food + wines), contact form, reservations
- Admin panel: manage menu categories/items and wines
- Image uploads: local (dev) or AWS S3 (production)
- Health endpoint: `GET /api/health`

## Run locally

### 1) Database (MySQL)

Create a database (example):

```sql
CREATE DATABASE deifratilicenta;
```

The backend initializes tables automatically on first run.

### 2) Backend

```bash
cd backend
npm install
copy .env.example .env
npm run dev
```

API runs on `http://localhost:5000`.

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on `http://localhost:8080` (admin at `/admin`).

Tip: there are helper scripts at the repo root (`start-dev.bat`, `start-dev.sh`).

## Environment variables (quick)

Frontend:

- `VITE_API_URL` — API base URL (e.g. `http://localhost:5000/api`)

Backend (common):

- DB connection: Railway MySQL vars (`MYSQLHOST`, `MYSQLPORT`, `MYSQLUSER`, `MYSQLPASSWORD`, `MYSQLDATABASE`) or local `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`
- `JWT_SECRET` — required for admin auth
- `CORS_ORIGINS` — comma-separated allowed origins (e.g. `https://gujuu.github.io`)
- `UPLOAD_MAX_MB` — optional upload limit

Optional (S3 uploads):

- `AWS_REGION`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` (and `AWS_SESSION_TOKEN` if using temporary creds)
- `AWS_S3_BUCKET`

## Deployment

- Frontend: GitHub Pages via workflow in `.github/workflows/`.
- Backend + DB: Railway (set Railway Root Directory to `backend/` and attach a MySQL plugin).

## License

Private/unlicensed by default (add a license if you plan to open-source).