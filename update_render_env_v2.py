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
    # Get current env vars
    current_vars_raw = api_get(f"/services/{service_id}/env-vars")
    
    # Render API returns [{"envVar": {"key": "...", "value": "..."}}]
    new_vars = []
    has_python = False
    
    for item in current_vars_raw:
        var = item.get("envVar", {})
        key = var.get("key")
        val = var.get("value")
        if key == "PYTHON_VERSION":
            val = "3.11.8"
            has_python = True
        new_vars.append({"key": key, "value": val})
        
    if not has_python:
        new_vars.append({"key": "PYTHON_VERSION", "value": "3.11.8"})
    
    print("New Env Vars Payload:", json.dumps(new_vars, indent=2))
        
    env_url = f"https://api.render.com/v1/services/{service_id}/env-vars"
    
    req = urllib.request.Request(env_url, method="PUT")
    req.add_header("Authorization", f"Bearer {RENDER_TOKEN}")
    req.add_header("Accept", "application/json")
    req.add_header("Content-Type", "application/json")
    req.data = json.dumps(new_vars).encode()
    
    try:
        with urllib.request.urlopen(req, context=ctx) as r:
            print("Env updated safely:", r.status)
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
