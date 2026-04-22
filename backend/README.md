## PhishGuard Backend (FastAPI)

### Local dev

- Create env from example:
  - Copy `.env.example` to `.env` and adjust values
- Install:
  - `python -m pip install -r requirements.txt`
- Run:
  - `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`

### Production deployment (Render/Railway/Fly)

This backend is designed to run as a normal long-running web service (not serverless).

#### Environment variables (required)

- `DATABASE_URL`: use Postgres in production (recommended)
- `SECRET_KEY`: long random string (>= 32 chars)
- `CORS_ORIGINS`: comma-separated list of allowed frontend origins (no trailing slash)

#### Environment variables (optional)

- `GROQ_API_KEY`: enables LLM-based `ai_insight`
- `GOOGLE_SAFE_BROWSING_API_KEY`: enables Google Safe Browsing blocklist checks

#### Start command

- `python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Notes

- DB tables are created automatically on startup via SQLAlchemy `Base.metadata.create_all(...)`.
- If `GROQ_API_KEY` is not set, the API still works with a deterministic fallback `ai_insight`.

