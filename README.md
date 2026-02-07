# Dei Frati Restaurant

Full-stack project for a restaurant website.

The website has a public area (home/menu/contact/reservations) and an admin area where you can manage menu items and wines.

## What's inside

- `frontend/` - React + TypeScript (Vite)
- `backend/` - Node.js + Express API + MySQL

## How to run (dev)

### 1) Database

You need a MySQL database.

Create a database (name used by default in the backend env):

```sql
CREATE DATABASE deifratilicenta;
```

The backend creates the tables automatically on first run.

### 2) Backend

```bash
cd backend
npm install
```

Copy env file and edit it:

```bash
copy .env.example .env
```

Then start:

```bash
npm run dev
```

Backend runs on: http://localhost:5000

### 3) Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on: http://localhost:8080

Admin page: http://localhost:8080/admin

## Notes

- Frontend API URL can be changed with `VITE_API_URL` (example: `http://localhost:5000/api`).
- Image upload works in 2 ways: local uploads (default in dev) or AWS S3 (if you configure S3 env vars in the backend).