"""Create GitHub repo named HOTEL-MANGEMENT."""
import urllib.request
import json
import ssl
import os

GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")
ctx = ssl.create_default_context()

payload = json.dumps({
    "name": "HOTEL-MANGEMENT",
    "description": "Hotel Management System - Next.js + FastAPI + PostgreSQL",
    "private": False,
    "auto_init": True
}).encode()

req = urllib.request.Request("https://api.github.com/user/repos", data=payload, method="POST")
req.add_header("Authorization", f"Bearer {GITHUB_TOKEN}")
req.add_header("Accept", "application/vnd.github+json")
req.add_header("User-Agent", "HotelManagement")
req.add_header("Content-Type", "application/json")

try:
    resp = urllib.request.urlopen(req, context=ctx, timeout=15)
    r = json.loads(resp.read().decode())
    print(f"✅ Repo created successfully!")
    print(f"  Name  : {r['full_name']}")
    print(f"  URL   : {r['html_url']}")
    print(f"  Clone : {r['clone_url']}")
except urllib.error.HTTPError as e:
    body = json.loads(e.read().decode())
    print(f"❌ Error {e.code}: {body.get('message', '')}")
    for err in body.get("errors", []):
        print(f"   - {err.get('message', err)}")
