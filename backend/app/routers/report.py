from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session
from ..database import get_db
from ..auth import get_current_user_optional
from ..services.generator import generate_phishing_variants
from ..services.analyzer import analyze_url
from ..services.pdf_service import generate_pdf_report

router = APIRouter(prefix="/api", tags=["report"])

@router.post("/report/download")
async def download_report(
    request: dict,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user_optional)
):
    domain = request.get("domain", "")
    variants_raw = request.get("variants", [])

    if not variants_raw:
        variants_raw = generate_phishing_variants(domain)
        variants_with_risk = []
        for v in variants_raw[:50]:
            analysis = analyze_url(v, enrich_ip=False)
            risk_level = "HIGH" if analysis['score'] >= 70 else ("MEDIUM" if analysis['score'] >= 40 else "LOW")
            variants_with_risk.append({
                "domain": v,
                "risk_score": analysis['score'],
                "risk_level": risk_level,
                "pattern": "Generated"
            })
    else:
        variants_with_risk = variants_raw

    pdf_bytes = generate_pdf_report(domain, variants_with_risk)

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=phishguard-{domain}-report.pdf"}
    )
