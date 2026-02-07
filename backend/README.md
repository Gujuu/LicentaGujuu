# Backend (API)

Simple Express API for the Dei Frati website.

It uses MySQL for data and JWT for login. For images it can use local uploads (default) or AWS S3 (optional).

## Requirements

- Node.js
- MySQL

## Setup

1) Install dependencies

```bash
cd backend
npm install
```

2) Create the database

```sql
CREATE DATABASE restaurant_DB;
```

3) Env file

There is an example in `.env.example`.

On Windows:

```bash
copy .env.example .env
```

Update DB values in `.env` (host/user/password).

4) Run

```bash
npm run dev
```

API runs on: http://localhost:5000

The tables are created automatically when the server starts.

## Images (local vs S3)

- If you don't set S3 credentials, uploads are saved locally in `backend/uploads/` and are served from `/uploads/...`.
- If you want S3, fill the AWS variables in `.env` and set `STORAGE_DRIVER=s3`.

## First admin user

Register is protected (admin only), so you need a first admin in the DB.

1) Generate a password hash:

```bash
node -e "const b=require('bcryptjs'); console.log(b.hashSync('admin123',10))"
```

2) Insert user in MySQL (replace the hash):

```sql
INSERT INTO users (name, email, password, role)
VALUES ('Admin', 'admin@deifratilicenta.com', '<PASTE_HASH_HERE>', 'admin');
```

Then you can login from the frontend and create other users via the API.

## Useful scripts

- `npm run seed:menu` - adds menu + wines from the static file
- `npm run seed:reset` - clears menu/categories/wines then reseeds
- `npm run migrate:s3` - moves local `/uploads/*` to S3 and updates URLs
- `npm run reorg:s3:dry` - shows how S3 media would be reorganized