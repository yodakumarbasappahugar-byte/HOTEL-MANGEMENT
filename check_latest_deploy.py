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
            print(f"Service: {svc['name']}")
            deploys = api_get(f"/services/{svc['id']}/deploys")
            if deploys:
                latest = deploys[0].get("deploy", {})
                print(f"Latest Deploy Status: {latest.get('status')}")
                print(f"Latest Commit: {latest.get('commit', {}).get('id')}")
            break
