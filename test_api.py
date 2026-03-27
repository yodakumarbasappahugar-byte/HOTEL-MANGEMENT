import requests
import json

base_url = "https://hotel-management-backend-2xln.onrender.com"

endpoints = [
    "/api/ping",
    "/api/health",
    "/api/status",
    "/api/rooms",
    "/api/db-test"
]

print(f"Testing Ayodhdya Hotel API at {base_url}...\n")

for endpoint in endpoints:
    url = f"{base_url}{endpoint}"
    print(f"Testing {endpoint}...")
    try:
        response = requests.get(url, timeout=15)
        print(f"Status Code: {response.status_code}")
        try:
            print(f"Response: {json.dumps(response.json(), indent=2)}")
        except:
            print(f"Response (text): {response.text[:200]}")
    except Exception as e:
        print(f"Request failed: {str(e)}")
    print("-" * 40)
