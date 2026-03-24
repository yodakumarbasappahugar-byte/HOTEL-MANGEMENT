"""Test Vercel API connection."""
import urllib.request
import json
import ssl
import os

VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
ctx = ssl.create_default_context()

def api_get(path):
    req = urllib.request.Request(f"https://api.vercel.com{path}")
    req.add_header("Authorization", f"Bearer {VERCEL_TOKEN}")
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, context=ctx, timeout=15) as r:
        return json.loads(r.read().decode())

print("=" * 50)
print("  VERCEL API CONNECTION TEST")
print("=" * 50)

# Test 1: Get current user
print("\n[1/2] Fetching user info...")
try:
    user_data = api_get("/v2/user")
    u = user_data.get("user", {})
    print(f"  Name     : {u.get('name', 'N/A')}")
    print(f"  Username : {u.get('username', 'N/A')}")
    print(f"  Email    : {u.get('email', 'N/A')}")
    print(f"  Plan     : {u.get('billing', {}).get('plan', 'N/A') if isinstance(u.get('billing'), dict) else u.get('softBlock', {}).get('blockedAt', 'free')}")
except Exception as e:
    print(f"  FAILED: {e}")
    exit(1)

# Test 2: List projects
print("\n[2/2] Listing projects...")
try:
    proj_data = api_get("/v9/projects")
    projects = proj_data.get("projects", [])
    print(f"  Found {len(projects)} project(s):")
    for p in projects:
        print(f"    - {p.get('name', 'N/A')} (framework: {p.get('framework', 'N/A')})")
except Exception as e:
    print(f"  FAILED: {e}")

print("\n" + "=" * 50)
print("  ✅ Vercel connection is working!")
print("=" * 50)
