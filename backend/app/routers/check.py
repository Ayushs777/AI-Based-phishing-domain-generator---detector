from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session
import json
from ..database import get_db
from .. import models
from ..auth import get_current_user_optional
from ..services.analyzer import analyze_url
from ..services.whois_service import get_whois_data
from ..services.ssl_service import check_ssl
from ..services.safebrowsing import check_google_safebrowsing
from ..services.ai_service import get_ai_analysis
from ..schemas import URLCheckRequest

router = APIRouter(prefix="/api", tags=["check"])

@router.post("/check")
async def check_url(
    request: URLCheckRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional)
):
    url = request.url.strip()
    if not url.startswith(('http://', 'https://')):
        url = 'https://' + url

    # Run all analysis
    analysis = analyze_url(url)
    domain = analysis["domain"]

    whois_data = get_whois_data(domain)
    ssl_data = check_ssl(domain)
    on_safebrowsing = check_google_safebrowsing(url)

    # Adjust score for domain age
    if whois_data.get('domain_age_days') is not None:
        if whois_data['domain_age_days'] < 30:
            analysis['score'] = min(analysis['score'] + 20, 100)
            analysis['flags'].append("Domain is less than 30 days old — very high risk indicator")
        elif whois_data['domain_age_days'] < 180:
            analysis['score'] = min(analysis['score'] + 8, 100)

    # Adjust for invalid SSL
    if not ssl_data.get('valid'):
        analysis['score'] = min(analysis['score'] + 10, 100)
        analysis['flags'].append("No valid SSL certificate found")

    # Confirmed on blocklist
    if on_safebrowsing:
        analysis['score'] = 100
        analysis['flags'].insert(0, "CONFIRMED: Listed on Google Safe Browsing blocklist")

    ai_insight = get_ai_analysis(
        domain, analysis['score'], analysis['flags'],
        whois_data, ssl_data, on_safebrowsing
    )

    # 4. Integrate AI Verdict into final score
    # Prevent AI from downgrading a critically high heuristic score
    if analysis['score'] >= 70 and ai_insight.get('verdict') != 'PHISHING':
        ai_insight['verdict'] = 'PHISHING'
        ai_insight['summary'] = "Heuristics override: " + ai_insight.get('summary', 'Critical threat detected.')

    if ai_insight.get('verdict') == 'PHISHING':
        if ai_insight.get('confidence') == 'HIGH':
            analysis['score'] = max(analysis['score'], 85)
        else:
            analysis['score'] = max(analysis['score'], 70)
        if "AI-detected phishing threat" not in analysis['flags']:
            analysis['flags'].append(f"AI Verdict: {ai_insight.get('summary')}")
    elif ai_insight.get('verdict') == 'SUSPICIOUS':
        analysis['score'] = max(analysis['score'], 45)

    # Final calculation of is_phishing based on adjusted score and AI verdict
    analysis['is_phishing'] = analysis['score'] >= 70 or ai_insight.get('verdict') == 'PHISHING'

    # Save to DB
    scan = models.ScanResult(
        user_id=current_user.id if current_user else None,
        url=url,
        domain=domain,
        risk_score=analysis['score'],
        is_phishing=analysis['is_phishing'],
        flags=json.dumps(analysis['flags']),
        ai_insight=json.dumps(ai_insight),
        whois_data=json.dumps(whois_data),
        ssl_valid=ssl_data.get('valid', False),
        ssl_issuer=ssl_data.get('issuer'),
        domain_age_days=whois_data.get('domain_age_days'),
        ip_address=analysis.get('ip_address'),
        country=analysis.get('country'),
        on_google_safebrowsing=on_safebrowsing
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)

    return {
        "id": scan.id,
        "url": url,
        "domain": domain,
        "risk_score": analysis['score'],
        "is_phishing": analysis['is_phishing'],
        "flags": analysis['flags'],
        "ai_insight": ai_insight,
        "whois": whois_data,
        "ssl": ssl_data,
        "country": analysis.get('country'),
        "ip_address": analysis.get('ip_address'),
        "on_google_safebrowsing": on_safebrowsing
    }

@router.get("/history")
def get_history(db: Session = Depends(get_db), current_user=Depends(get_current_user_optional)):
    if not current_user:
        return []
    results = db.query(models.ScanResult).filter(
        models.ScanResult.user_id == current_user.id
    ).order_by(models.ScanResult.created_at.desc()).limit(50).all()
    return [
        {
            "id": r.id,
            "url": r.url,
            "domain": r.domain,
            "risk_score": r.risk_score,
            "is_phishing": r.is_phishing,
            "created_at": str(r.created_at)
        }
        for r in results
    ]
