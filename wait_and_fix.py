"""
Poll until Render redeploys, then fix the image paths in the DB.
"""
import urllib.request
import json
import time

BASE = 'https://hotel-management-backend-2xln.onrender.com'

def post(path):
    req = urllib.request.Request(BASE + path, data=b'', method='POST')
    req.add_header('Content-Type', 'application/json')
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.load(r)

def get(path):
    with urllib.request.urlopen(BASE + path, timeout=30) as r:
        return json.load(r)

print("Waiting for Render to redeploy (up to 5 minutes)...")
for attempt in range(20):
    try:
        result = post('/api/rooms/fix-images')
        print(f"SUCCESS: {result}")
        # Verify the fix
        rooms = get('/api/rooms')
        print("\nVerified room image paths:")
        for r in rooms:
            print(f"  {r['name']}: {r['image_url']}")
        break
    except urllib.error.HTTPError as e:
        if e.code == 405:
            print(f"  Attempt {attempt+1}/20: Endpoint not yet deployed (405). Waiting 15s...")
        else:
            print(f"  Attempt {attempt+1}/20: HTTP {e.code}. Waiting 15s...")
        time.sleep(15)
    except Exception as e:
        print(f"  Attempt {attempt+1}/20: {e}. Waiting 15s (backend may be cold-starting)...")
        time.sleep(15)
else:
    print("Timed out. Please run this script again in a few minutes.")
