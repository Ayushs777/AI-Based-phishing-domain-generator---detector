from sqlalchemy import Column, Integer, String, Float, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    scans = relationship("ScanResult", back_populates="user")

class ScanResult(Base):
    __tablename__ = "scan_results"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    url = Column(String, index=True)
    domain = Column(String)
    risk_score = Column(Float)
    is_phishing = Column(Boolean)
    flags = Column(Text)  # JSON string
    ai_insight = Column(Text)
    whois_data = Column(Text)  # JSON string
    ssl_valid = Column(Boolean)
    ssl_issuer = Column(String, nullable=True)
    domain_age_days = Column(Integer, nullable=True)
    ip_address = Column(String, nullable=True)
    country = Column(String, nullable=True)
    on_google_safebrowsing = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="scans")

class GeneratedReport(Base):
    __tablename__ = "generated_reports"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    target_domain = Column(String)
    total_variants = Column(Integer)
    pdf_path = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
