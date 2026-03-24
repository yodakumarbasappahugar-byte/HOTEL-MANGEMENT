import urllib.request
import json
import ssl
import os

RENDER_TOKEN = os.environ.get("RENDER_TOKEN", "rnd_8qZeh3EPfPlHCXTDNsUKGdfnsL5E")
GITHUB_REPO = "https://github.com/yodakumarbasappahugar-byte/HOTEL-MANGEMENT"

ctx = ssl.create_default_context()

def create_service():
    print("Fetching owner ID...")
    req = urllib.request.Request("https://api.render.com/v1/owners")
    req.add_header("Authorization", f"Bearer {RENDER_TOKEN}")
    req.add_header("Accept", "application/json")
    
    with urllib.request.urlopen(req, context=ctx) as r:
        owners = json.loads(r.read().decode())
        owner_id = owners[0]["owner"]["id"] if "owner" in owners[0] else owners[0]["id"]
        
    print(f"Creating Web Service for owner {owner_id}...")
    
    payload = {
        "type": "web_service",
        "name": "hotel-management-backend",
        "ownerId": owner_id,
        "repo": GITHUB_REPO,
        "branch": "main",
        "autoDeploy": "yes",
        "serviceDetails": {
            "env": "python",
            "region": "oregon",
            "plan": "free",
            "pullRequestPreviewsEnabled": "no",
            "envSpecificDetails": {
                "buildCommand": "pip install -r backend/requirements.txt",
                "startCommand": "cd backend && uvicorn main:app --host 0.0.0.0 --port 10000"
            }
        }
    }
    
    create_req = urllib.request.Request("https://api.render.com/v1/services", method="POST")
    create_req.add_header("Authorization", f"Bearer {RENDER_TOKEN}")
    create_req.add_header("Accept", "application/json")
    create_req.add_header("Content-Type", "application/json")
    create_req.data = json.dumps(payload).encode()
    
    try:
        with urllib.request.urlopen(create_req, context=ctx) as r:
            result = json.loads(r.read().decode())
            print("Successfully created Render Service!")
            print(f"Service ID: {result.get('id', 'N/A')}")
            print(f"URL: {result.get('service', {}).get('serviceDetails', {}).get('url', 'N/A')}")
            return result
    except Exception as e:
        print(f"Failed to create service: {e}")
        if hasattr(e, 'read'):
            print(e.read().decode())

if __name__ == "__main__":
    create_service()
