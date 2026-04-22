from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from .database import Base, engine
from .config import settings
from .routers import check, generate, report, auth as auth_router

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Use memory for rate limiting instead of Redis
limiter = Limiter(key_func=get_remote_address, storage_uri="memory://")

app = FastAPI(
    title="PhishGuard API",
    description="AI-powered Phishing Detection & Analysis",
    version="1.0.0"
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

cors = settings.CORS_ORIGINS.strip()
if cors == "*":
    allow_origins = ["*"]
else:
    allow_origins = [o.strip().rstrip("/") for o in cors.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(check.router)
app.include_router(generate.router)
app.include_router(report.router)

@app.get("/")
def root():
    return {
        "status": "PhishGuard API Online",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }

@app.get("/health")
def health():
    return {"status": "healthy"}
