import urllib.request
import json
import ssl

RENDER_TOKEN = "rnd_8qZeh3EPfPlHCXTDNsUKGdfnsL5E"
ctx = ssl.create_default_context()

def api_get(path):
    req = urllib.request.Request(f"https://api.render.com/v1{path}")
    req.add_header("Authorization", f"Bearer {RENDER_TOKEN}")
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, context=ctx) as r:
        return json.loads(r.read().decode())

def update_env(service_id):
    env_url = f"https://api.render.com/v1/services/{service_id}"
    
    payload = {
        "envVars": [
            {"key": "PYTHON_VERSION", "value": "3.11.8"}
        ]
    }
    
    req = urllib.request.Request(env_url, method="PATCH")
    req.add_header("Authorization", f"Bearer {RENDER_TOKEN}")
    req.add_header("Accept", "application/json")
    req.add_header("Content-Type", "application/json")
    req.data = json.dumps(payload).encode()
    
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            print("Service updated safely:", r.status)
    except Exception as e:
        print("Env update error:", e)
        if hasattr(e, 'read'):
            print(e.read().decode())

if __name__ == "__main__":
    services = api_get("/services")
    for s in services:
        svc = s.get("service", {})
        if svc.get("name") == "hotel-management-backend":
            print(f"Found service '{svc['name']}' with ID {svc['id']}")
            update_env(svc['id'])
            break
