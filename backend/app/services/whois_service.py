import whois
import json
from datetime import datetime

def get_whois_data(domain: str) -> dict:
    try:
        clean_domain = domain.split('/')[0].replace('www.', '')
        w = whois.whois(clean_domain)

        creation_date = w.creation_date
        if isinstance(creation_date, list):
            creation_date = creation_date[0]

        expiration_date = w.expiration_date
        if isinstance(expiration_date, list):
            expiration_date = expiration_date[0]

        domain_age_days = None
        if creation_date and isinstance(creation_date, datetime):
            domain_age_days = (datetime.utcnow() - creation_date).days

        return {
            "registrar": str(w.registrar) if w.registrar else "Unknown",
            "creation_date": str(creation_date) if creation_date else None,
            "expiration_date": str(expiration_date) if expiration_date else None,
            "domain_age_days": domain_age_days,
            "country": str(w.country) if w.country else None,
            "name_servers": w.name_servers if w.name_servers else [],
            "status": str(w.status) if w.status else "Unknown",
            "emails": w.emails if w.emails else [],
        }
    except Exception as e:
        return {
            "registrar": "Unknown",
            "creation_date": None,
            "expiration_date": None,
            "domain_age_days": None,
            "country": None,
            "name_servers": [],
            "status": "Could not fetch",
            "emails": [],
            "error": str(e)
        }
