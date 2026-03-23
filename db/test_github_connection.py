"""Test GitHub API connection."""
import urllib.request
import json
import ssl
import os

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
ctx = ssl.create_default_context()

def api_get(path):
    req = urllib.request.Request(f"https://api.github.com{path}")
    req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
    req.add_header("Accept", "application/vnd.github+json")
    req.add_header("User-Agent", "HotelManagement-Test")
    with urllib.request.urlopen(req, context=ctx, timeout=15) as r:
        return json.loads(r.read().decode())

print("=" * 50)
print("  GITHUB API CONNECTION TEST")
print("=" * 50)

# Test 1: Get authenticated user
print("\n[1/2] Fetching user info...")
try:
    user = api_get("/user")
    print(f"  Login    : {user.get('login', 'N/A')}")
    print(f"  Name     : {user.get('name', 'N/A')}")
    print(f"  Email    : {user.get('email', 'N/A')}")
    print(f"  Plan     : {user.get('plan', {}).get('name', 'N/A')}")
    print(f"  Repos    : {user.get('public_repos', 0)} public, {user.get('total_private_repos', 0)} private")
except urllib.error.HTTPError as e:
    print(f"  FAILED (HTTP {e.code}): {e.read().decode()}")
    exit(1)
except Exception as e:
    print(f"  FAILED: {e}")
    exit(1)

# Test 2: List repos
print("\n[2/2] Listing repositories...")
try:
    repos = api_get("/user/repos?per_page=10&sort=updated")
    print(f"  Found {len(repos)} recent repo(s):")
    for r in repos[:5]:
        print(f"    - {r.get('full_name', 'N/A')} ({'private' if r.get('private') else 'public'})")
except Exception as e:
    print(f"  FAILED: {e}")

print("\n" + "=" * 50)
print("  ✅ GitHub connection is working!")
print("=" * 50)
