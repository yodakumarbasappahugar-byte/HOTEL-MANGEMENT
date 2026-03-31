"""
Fix image paths in the database by directly updating room records.
Uses the Neon DB connection string from the backend.
"""
import urllib.request
import json

BASE_URL = 'https://hotel-management-backend-2xln.onrender.com'

def call_api(path, method='GET', data=None):
    url = BASE_URL + path
    body = json.dumps(data).encode() if data else None
    req = urllib.request.Request(url, data=body, method=method)
    if body:
        req.add_header('Content-Type', 'application/json')
    try:
        with urllib.request.urlopen(req, timeout=30) as response:
            return json.load(response)
    except Exception as e:
        print(f"Error calling {path}: {e}")
        return None

# Step 1: Get current rooms
print("Fetching current rooms...")
rooms = call_api('/api/rooms')
if rooms:
    print(f"Found {len(rooms)} rooms:")
    for r in rooms:
        print(f"  ID={r['id']}, name={r['name']}, image_url={r['image_url']}")
else:
    print("Could not fetch rooms - backend may be sleeping")
