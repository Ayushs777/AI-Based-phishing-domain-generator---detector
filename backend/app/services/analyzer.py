import re
import socket
import json
import requests
from urllib.parse import urlparse
from datetime import datetime

SUSPICIOUS_KEYWORDS = [
    "login", "verify", "secure", "account", "update", "confirm",
    "banking", "paypal", "amazon", "google", "apple", "microsoft",
    "signin", "password", "credential", "wallet", "crypto", "urgent",
    "support", "service", "billing", "invoice", "payment", "re-login",
    "steam", "discord", "telegram", "facebook", "instagram", "twitter",
    "coinbase", "binance", "metamask", "ledger", "trezor", "netflix",
    "disney", "adobe", "office365", "sharepoint", "dropbox", "onedrive"
]

MALICIOUS_SLANG = ["lolz", "hack", "crack", "free", "vbucks", "generator", "cheat", "mod", "apk", "pwned"]

COMMON_TLDS_FOR_ABUSE = [".xyz", ".top", ".click", ".tk", ".ml", ".ga", ".cf", ".gq", ".icu", ".buzz", ".cam"]

def calculate_entropy(text: str) -> float:
    import math
    if not text:
        return 0
    entropy = 0
    for x in range(256):
        p_x = text.count(chr(x)) / len(text)
        if p_x > 0:
            entropy += - p_x * math.log2(p_x)
    return entropy

def analyze_url(url: str, enrich_ip: bool = True) -> dict:
    try:
        if not url.startswith(('http://', 'https://')):
            url = 'https://' + url
        parsed = urlparse(url)
        domain = parsed.netloc.lower().replace('www.', '')
        path = parsed.path.lower()
        score = 0
        flags = []

        # 1. IP address used as domain
        if re.match(r'^\d{1,3}(\.\d{1,3}){3}$', domain):
            score += 35
            flags.append("IP address used instead of domain — major phishing indicator")

        # 2. Too many subdomains
        subdomain_count = domain.count('.')
        if subdomain_count > 3:
            score += 20
            flags.append(f"Excessive subdomains ({subdomain_count}) — domain obfuscation technique")

        # 3. Suspicious keywords
        for kw in SUSPICIOUS_KEYWORDS:
            if kw in domain:
                score += 15
                flags.append(f"Suspicious keyword '{kw}' found in domain")
                break

        # 4. Lookalike / homograph characters
        lookalikes = {
            '0': 'o', '1': 'l', 'rn': 'm', 'vv': 'w',
            'cl': 'd', '5': 's', '3': 'e'
        }
        for fake, real in lookalikes.items():
            if fake in domain.replace('.', ''):
                score += 15
                flags.append(f"Lookalike character substitution '{fake}→{real}' detected")
                break

        # 5. Long domain
        if len(domain) > 50:
            score += 15
            flags.append(f"Unusually long domain ({len(domain)} chars) — obfuscation attempt")

        # 6. Hyphen abuse
        hyphen_count = domain.count('-')
        if hyphen_count > 2:
            score += 10
            flags.append(f"Excessive hyphens ({hyphen_count}) in domain — phishing pattern")

        # 7. Abused TLDs
        for tld in COMMON_TLDS_FOR_ABUSE:
            if domain.endswith(tld):
                score += 15
                flags.append(f"High-risk TLD '{tld}' commonly used in phishing")
                break

        # 8. Malicious Slang
        for slang in MALICIOUS_SLANG:
            if slang in domain:
                if slang == 'lolz':
                    score += 75
                    flags.append(f"CRITICAL: Known hacking/phishing community keyword '{slang}'")
                else:
                    score += 50
                    flags.append(f"Suspicious slang/keyword '{slang}' found in domain")
                break

        # 9. Entropy Check (DGA detection)
        entropy = calculate_entropy(domain.split('.')[0])
        if entropy > 4.2:
            score += 20
            flags.append(f"High character entropy ({entropy:.2f}) — possible DGA domain")

        # 10. URL encoding tricks
        if '%' in url:
            score += 10
            flags.append("URL encoding found — possible obfuscation of malicious path")

        # 9. Suspicious path keywords
        path_keywords = ['login', 'verify', 'account', 'secure', 'update', 'confirm', 'banking']
        for kw in path_keywords:
            if kw in path:
                score += 8
                flags.append(f"Suspicious path keyword '{kw}'")
                break

        # 10. Multiple @ symbols (URL manipulation)
        if url.count('@') > 0:
            score += 25
            flags.append("@ symbol in URL — credential injection attack vector")

        # Resolve IP / geo enrichment (can be disabled for bulk generation)
        ip_address = None
        country = None
        if enrich_ip:
            try:
                ip_address = socket.gethostbyname(domain.split('/')[0])
                ip_resp = requests.get(f"http://ip-api.com/json/{ip_address}", timeout=3)
                if ip_resp.status_code == 200:
                    ip_data = ip_resp.json()
                    country = ip_data.get('country')
                    # High-risk countries for phishing (simplified heuristic)
                    if ip_data.get('countryCode') in ['NG', 'RU', 'CN', 'RO', 'BR']:
                        score += 5
                        flags.append(f"IP hosted in high-risk country: {country}")
            except:
                pass

        return {
            "score": min(int(score), 100),
            "flags": flags,
            "domain": domain,
            "url": url,
            "ip_address": ip_address,
            "country": country,
            "is_phishing": score >= 50
        }
    except Exception as e:
        return {
            "score": 0, "flags": [f"Analysis error: {str(e)}"],
            "domain": url, "url": url, "ip_address": None,
            "country": None, "is_phishing": False
        }
