import json

from ..config import settings


def _verdict_from_score(score: int, on_safebrowsing: bool) -> str:
    if on_safebrowsing:
        return "PHISHING"
    if score >= 70:
        return "PHISHING"
    if score >= 40:
        return "SUSPICIOUS"
    return "SAFE"


def _fallback_ai(domain: str, score: int, flags: list, on_safebrowsing: bool) -> dict:
    verdict = _verdict_from_score(score, on_safebrowsing)
    confidence = "HIGH" if on_safebrowsing or len(flags) >= 3 else ("MEDIUM" if flags else "LOW")
    why = flags[:3] if flags else ["No strong phishing heuristics were detected."]
    attack_type = "Credential harvesting" if any("login" in f.lower() for f in flags) else "Brand spoofing"
    what_to_do = (
        "Do not enter credentials. Verify the official domain via a trusted source and report the URL."
        if verdict != "SAFE"
        else "Proceed normally, but stay cautious if the page asks for sensitive information."
    )
    summary = (
        "High-risk indicators strongly suggest phishing activity."
        if verdict == "PHISHING"
        else "Some suspicious indicators were found; treat with caution."
        if verdict == "SUSPICIOUS"
        else "No major phishing indicators detected by heuristics."
    )
    return {
        "verdict": verdict,
        "confidence": confidence,
        "summary": summary,
        "why_suspicious": why,
        "attack_type": attack_type,
        "what_to_do": what_to_do,
        "technical_note": "Fallback insight generated locally (no LLM key configured).",
    }


def get_ai_analysis(
    domain: str,
    score: int,
    flags: list,
    whois_data: dict,
    ssl_data: dict,
    on_safebrowsing: bool,
) -> dict:
    # If no Groq key, keep API fully functional with a deterministic fallback.
    if not settings.GROQ_API_KEY:
        return _fallback_ai(domain, score, flags, on_safebrowsing)

    try:
        from groq import Groq

        client = Groq(api_key=settings.GROQ_API_KEY)

        domain_age = whois_data.get("domain_age_days")
        if domain_age is not None:
            if domain_age < 30:
                age_str = f"Very new domain ({domain_age} days old) — HIGH RISK"
            elif domain_age < 180:
                age_str = f"Relatively new domain ({domain_age} days old) — MEDIUM RISK"
            else:
                age_str = f"Established domain ({domain_age} days old)"
        else:
            age_str = "Domain age unknown"

        prompt = f"""You are an elite cybersecurity threat analyst specialized in phishing and social engineering.
Analyze the following domain and metadata to determine if it's a threat.

Domain: {domain}
Initial Risk Score: {score}/100
Heuristic Flags:
{chr(10).join(f'- {f}' for f in flags) if flags else '- None detected'}

Additional Metadata:
- {age_str}
- Registrar: {whois_data.get('registrar', 'Unknown')}
- SSL Certificate: {'Valid' if ssl_data.get('valid') else 'Invalid/Missing'}
- SSL Issuer: {ssl_data.get('issuer', 'Unknown')}
- On Google Safe Browsing: {'YES' if on_safebrowsing else 'No'}

Instructions:
1. Look for brand spoofing (e.g., 'g00gle', 'support-apple').
2. Identify deceptive keywords (e.g., 'lolz', 'crack', 'login-verify').
3. Evaluate the domain's purpose: Does it look like a legitimate business or a trap?
4. If the domain is very new (<30 days), be extremely suspicious.
5. Consider 'lolz' sites as high-risk for malware/phishing distribution.

Return ONLY a JSON object:
{{
  "verdict": "PHISHING" | "SUSPICIOUS" | "SAFE",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "summary": "Concise explanation of the threat",
  "why_suspicious": ["reason 1", "reason 2"],
  "attack_type": "Specific attack vector",
  "what_to_do": "Direct advice for the user",
  "technical_note": "Deep analysis for security pros"
}}"""

        completion = client.chat.completions.create(
            model="llama-3.1-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a cybersecurity expert. Return ONLY JSON."},
                {"role": "user", "content": prompt},
            ],
            response_format={"type": "json_object"},
        )

        text = completion.choices[0].message.content.strip()
        parsed = json.loads(text)
        # Normalize to the 3 verdicts the UI expects.
        parsed["verdict"] = parsed.get("verdict") if parsed.get("verdict") in {"PHISHING", "SUSPICIOUS", "SAFE"} else _verdict_from_score(score, on_safebrowsing)
        return parsed
    except Exception:
        return _fallback_ai(domain, score, flags, on_safebrowsing)
