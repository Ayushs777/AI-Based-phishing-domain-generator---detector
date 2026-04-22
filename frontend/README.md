## PhishGuard Frontend (Vite + React)

### Local dev

- Install:
  - `npm install`
- Run:
  - `npm run dev`

By default, the frontend uses `VITE_API_URL` if set, otherwise it calls `http://localhost:8000`.

### Vercel deployment

- In Vercel, set **Root Directory** to `phishguard/frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Add environment variable:
  - `VITE_API_URL` = your backend public URL (e.g. `https://your-api.onrender.com`)

