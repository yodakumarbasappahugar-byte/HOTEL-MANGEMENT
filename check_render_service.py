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

if __name__ == "__main__":
    services = api_get("/services")
    for s in services:
        svc = s.get("service", {})
        if svc.get("name") == "hotel-management-backend":
            print("SERVICE DETAILS:")
            print(json.dumps(svc, indent=2))
            # Also get env vars
            env_vars = api_get(f"/services/{svc['id']}/env-vars")
            print("ENV VARS:")
            print(json.dumps(env_vars, indent=2))
            break
