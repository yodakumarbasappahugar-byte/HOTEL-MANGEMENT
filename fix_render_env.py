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
    print(f"Updating env for {service_id}")
    env_url = f"https://api.render.com/v1/services/{service_id}/env-vars"
    
    # We want to put [] or post. Actually it's PUT /v1/services/{serviceId}/env-vars
    payload = [
        {"envVar": {"key": "PYTHON_VERSION", "value": "3.11.8"}}
    ]
    
    req = urllib.request.Request(env_url, method="PUT")
    req.add_header("Authorization", f"Bearer {RENDER_TOKEN}")
    req.add_header("Accept", "application/json")
    req.add_header("Content-Type", "application/json")
    req.data = json.dumps(payload).encode()
    
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            print("Env updated safely:", r.status)
    except Exception as e:
        print("Env update error:", e)

def trigger_deploy(service_id):
    url = f"https://api.render.com/v1/services/{service_id}/deploys"
    req = urllib.request.Request(url, method="POST")
    req.add_header("Authorization", f"Bearer {RENDER_TOKEN}")
    req.add_header("Accept", "application/json")
    req.add_header("Content-Type", "application/json")
    req.data = b'{}'
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            print("Deploy triggered:", r.status)
    except Exception as e:
        print("Deploy trigger error:", e)

if __name__ == "__main__":
    services = api_get("/services")
    for s in services:
        svc = s.get("service", {})
        if svc.get("name") == "hotel-management-backend":
            print(f"Found service '{svc['name']}' with ID {svc['id']}")
            update_env(svc['id'])
            trigger_deploy(svc['id'])
            break
