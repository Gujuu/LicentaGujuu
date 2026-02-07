# Frontend

React + TypeScript frontend (Vite) for the Dei Frati restaurant website.

Pages include the public site (menu/contact/reservations) and an admin page for managing menu items and wines.

## Run (dev)

```bash
cd frontend
npm install
npm run dev
```

Open: http://localhost:8080

Admin route: http://localhost:8080/admin

## API URL

By default the frontend calls: `http://localhost:5000/api`.

If your backend is on another URL, create a `.env` file in `frontend/`:

```env
VITE_API_URL=http://localhost:5000/api
```

## Tech used

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components (in `src/components/ui`)
