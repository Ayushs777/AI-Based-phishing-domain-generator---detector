from pydantic import BaseModel, HttpUrl
from typing import Optional, List
from datetime import datetime

class URLCheckRequest(BaseModel):
    url: str

class GenerateRequest(BaseModel):
    domain: str

class ScanResultResponse(BaseModel):
    id: int
    url: str
    domain: str
    risk_score: float
    is_phishing: bool
    flags: List[str]
    ai_insight: str
    ssl_valid: bool
    ssl_issuer: Optional[str]
    domain_age_days: Optional[int]
    country: Optional[str]
    on_google_safebrowsing: bool
    created_at: datetime

    class Config:
        from_attributes = True

class GenerateResponse(BaseModel):
    target_domain: str
    variants: List[dict]
    total: int

class UserCreate(BaseModel):
    email: str
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
