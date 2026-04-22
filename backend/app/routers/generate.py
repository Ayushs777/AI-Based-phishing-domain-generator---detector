from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user_optional
from ..services.generator import generate_phishing_variants
from ..services.analyzer import analyze_url
from ..schemas import GenerateRequest
import re

router = APIRouter(prefix="/api", tags=["generate"])

def classify_pattern(variant: str, original: str) -> str:
    name = original.split('.')[0]
    head = variant.split('.')[0]
    if any(ch.isdigit() for ch in head) and any(ch.isalpha() for ch in head):
        return "Character substitution"
    if variant.split('.')[-1] != original.split('.')[-1]:
        return "TLD substitution"
    if variant.startswith(('secure-', 'login-', 'verify-', 'my-', 'support-', 'account-')):
        return "Malicious prefix"
    if any(s in variant for s in ['-secure', '-login', '-verify', '-support']):
        return "Malicious suffix"
    if variant.count('.') > original.count('.') + 1:
        return "Subdomain spoofing"
    return "Typosquatting"

@router.post("/generate")
async def generate_domains(
    request: GenerateRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional)
):
    domain = request.domain.lower().strip().replace('https://', '').replace('http://', '').replace('www.', '')
    variants_raw = generate_phishing_variants(domain)

    results = []
    for variant in variants_raw[:50]:
        analysis = analyze_url(variant, enrich_ip=False)
        pattern = classify_pattern(variant, domain)
        risk_level = "HIGH" if analysis['score'] >= 70 else ("MEDIUM" if analysis['score'] >= 40 else "LOW")
        results.append({
            "domain": variant,
            "risk_score": analysis['score'],
            "risk_level": risk_level,
            "pattern": pattern,
            "flags": analysis['flags'][:2]
        })

    results.sort(key=lambda x: x['risk_score'], reverse=True)

    return {
        "target_domain": domain,
        "variants": results,
        "total": len(results)
    }
