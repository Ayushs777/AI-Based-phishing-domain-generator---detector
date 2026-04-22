import requests
from ..config import settings

def check_google_safebrowsing(url: str) -> bool:
    if not settings.GOOGLE_SAFE_BROWSING_API_KEY:
        return False
    try:
        api_url = f"https://safebrowsing.googleapis.com/v4/threatMatches:find?key={settings.GOOGLE_SAFE_BROWSING_API_KEY}"
        payload = {
            "client": {"clientId": "phishguard", "clientVersion": "1.0"},
            "threatInfo": {
                "threatTypes": ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE"],
                "platformTypes": ["ANY_PLATFORM"],
                "threatEntryTypes": ["URL"],
                "threatEntries": [{"url": url}]
            }
        }
        resp = requests.post(api_url, json=payload, timeout=5)
        data = resp.json()
        return bool(data.get("matches"))
    except:
        return False
