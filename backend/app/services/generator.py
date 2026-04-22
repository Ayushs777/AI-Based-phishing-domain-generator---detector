import itertools
import json

def generate_phishing_variants(domain: str) -> list:
    if '.' not in domain:
        return []

    parts = domain.rsplit('.', 1)
    name = parts[0].lower()
    tld = parts[1].lower()
    variants = set()

    # 1. Character substitution (typosquatting)
    char_subs = {
        'a': ['@', '4', 'á', 'à'],
        'e': ['3', 'é'],
        'i': ['1', 'l', '!'],
        'o': ['0', 'ó'],
        's': ['5', '$'],
        'g': ['9', 'q'],
        'l': ['1', 'I'],
        'b': ['6', 'd'],
        't': ['7'],
    }
    for i, char in enumerate(name):
        if char in char_subs:
            for sub in char_subs[char]:
                new_name = name[:i] + sub + name[i+1:]
                variants.add(f"{new_name}.{tld}")

    # 2. TLD substitution
    fake_tlds = ['com', 'net', 'org', 'co', 'io', 'site', 'online',
                 'info', 'biz', 'xyz', 'top', 'shop', 'store', 'app', 'live']
    for fake_tld in fake_tlds:
        if fake_tld != tld:
            variants.add(f"{name}.{fake_tld}")

    # 3. Prefix tricks
    prefixes = ['secure-', 'login-', 'verify-', 'my-', 'support-',
                'account-', 'update-', 'help-', 'official-', 'safe-']
    for p in prefixes:
        variants.add(f"{p}{domain}")

    # 4. Suffix tricks
    suffixes = ['-secure', '-login', '-verify', '-support', '-help',
                '-official', '-account', '-update', '-service', '-online']
    for s in suffixes:
        variants.add(f"{name}{s}.{tld}")

    # 5. Subdomain spoofing
    variants.add(f"{domain}.fake-login.com")
    variants.add(f"login.{name}-secure.{tld}")
    variants.add(f"account.{name}-verify.{tld}")
    variants.add(f"secure.{name}-login.{tld}")
    variants.add(f"www.{name}-{tld}.com")

    # 6. Character insertion (adjacent keys on keyboard)
    adjacent_keys = {
        'a': 'sq', 'b': 'vn', 'c': 'xv', 'd': 'sf',
        'e': 'rw', 'f': 'dg', 'g': 'fh', 'h': 'gj',
        'i': 'uo', 'j': 'hk', 'k': 'jl', 'l': 'k',
        'm': 'n', 'n': 'mb', 'o': 'ip', 'p': 'o',
        'q': 'wa', 'r': 'et', 's': 'ad', 't': 'ry',
        'u': 'yi', 'v': 'cb', 'w': 'qe', 'x': 'zc',
        'y': 'tu', 'z': 'x'
    }
    for i, char in enumerate(name):
        if char in adjacent_keys:
            for adj in adjacent_keys[char]:
                # insertion
                variants.add(f"{name[:i]}{adj}{name[i:]}.{tld}")
                # replacement
                variants.add(f"{name[:i]}{adj}{name[i+1:]}.{tld}")

    # 7. Character omission
    for i in range(len(name)):
        if len(name) > 3:
            variants.add(f"{name[:i]}{name[i+1:]}.{tld}")

    # 8. Character repetition
    for i, char in enumerate(name):
        variants.add(f"{name[:i]}{char}{char}{name[i+1:]}.{tld}")

    # 9. Dot insertion
    for i in range(1, len(name)):
        variants.add(f"{name[:i]}.{name[i:]}.{tld}")

    # Remove original domain from variants
    variants.discard(domain)
    variants.discard(f"www.{domain}")

    return sorted(list(variants))[:60]
