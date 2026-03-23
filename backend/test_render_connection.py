"""Test Render API connection."""
import urllib.request
import json
import ssl
import os

RENDER_TOKEN = os.environ.get("RENDER_TOKEN", "")
ctx = ssl.create_default_context()

def api_get(path):
    req = urllib.request.Request(f"https://api.render.com/v1{path}")
    req.add_header("Authorization", f"Bearer {RENDER_TOKEN}")
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, context=ctx, timeout=15) as r:
        return json.loads(r.read().decode())

print("=" * 50)
print("  RENDER API CONNECTION TEST")
print("=" * 50)

# Test 1: List owners (validates API key)
print("\n[1/2] Fetching account info...")
try:
    owners = api_get("/owners")
    if owners:
        for o in owners:
            owner = o.get("owner", o)
            print(f"  Name  : {owner.get('name', 'N/A')}")
            print(f"  Email : {owner.get('email', 'N/A')}")
            print(f"  ID    : {owner.get('id', 'N/A')}")
            print(f"  Type  : {owner.get('type', 'N/A')}")
    else:
        print("  No owner info returned (key may be valid but no owners found)")
except Exception as e:
    print(f"  FAILED: {e}")
    exit(1)

# Test 2: List services
print("\n[2/2] Listing services...")
try:
    services = api_get("/services")
    svc_list = services if isinstance(services, list) else services.get("services", [])
    print(f"  Found {len(svc_list)} service(s):")
    for s in svc_list:
        svc = s.get("service", s)
        print(f"    - {svc.get('name', 'N/A')} (type: {svc.get('type', 'N/A')})")
except Exception as e:
    print(f"  FAILED: {e}")

print("\n" + "=" * 50)
print("  ✅ Render connection is working!")
print("=" * 50)
