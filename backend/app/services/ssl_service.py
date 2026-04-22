import ssl
import socket
import json
from datetime import datetime

def check_ssl(domain: str) -> dict:
    try:
        clean_domain = domain.split('/')[0].replace('www.', '').split(':')[0]
        context = ssl.create_default_context()
        with socket.create_connection((clean_domain, 443), timeout=5) as sock:
            with context.wrap_socket(sock, server_hostname=clean_domain) as ssock:
                cert = ssock.getpeercert()
                issuer = dict(x[0] for x in cert.get('issuer', []))
                subject = dict(x[0] for x in cert.get('subject', []))
                not_after = cert.get('notAfter')
                expiry = datetime.strptime(not_after, "%b %d %H:%M:%S %Y %Z") if not_after else None
                days_left = (expiry - datetime.utcnow()).days if expiry else None
                return {
                    "valid": True,
                    "issuer": issuer.get('organizationName', 'Unknown'),
                    "subject": subject.get('commonName', clean_domain),
                    "expiry": str(expiry) if expiry else None,
                    "days_until_expiry": days_left,
                    "protocol": ssock.version()
                }
    except ssl.SSLCertVerificationError:
        return {"valid": False, "issuer": None, "error": "SSL certificate verification failed"}
    except Exception as e:
        return {"valid": False, "issuer": None, "error": str(e)}
