## PhishGuard Browser Extension (MV3)

### Configure for production

Open the extension popup → **Settings**:

- **Backend API URL**: your deployed backend (e.g. `https://your-api.onrender.com`)
- **Web App URL**: your deployed frontend (Vercel) (e.g. `https://your-app.vercel.app`)

These are stored in `chrome.storage.local` keys:

- `PG_API_BASE`
- `PG_WEB_BASE`

### Behavior

- On each navigation, the extension calls `POST /api/check` on the backend.
- Badge shows:
  - `!` for score >= 70
  - `?` for score >= 40
  - `✓` for score < 40
- For **score >= 70**, an interstitial warning page is shown to reduce accidental credential entry.

