import urllib.request
import json
import ssl

RENDER_TOKEN = "rnd_8qZeh3EPfPlHCXTDNsUKGdfnsL5E"
SERVICE_ID = "srv-d712dkma2pns73es2820"
ctx = ssl.create_default_context()

def get_logs():
    # Render API for logs: GET /services/{id}/logs would be great if it existed 
    # but usually we have to look for deployments or check the metrics.
    # Actually, Render doesn't have a simple "get logs" API endpoint that returns plain text logs easily without a stream.
    # However, we can check the DEPLOYMENTS to see if the build failed.
    req = urllib.request.Request(f"https://api.render.com/v1/services/{SERVICE_ID}/deployments")
    req.add_header("Authorization", f"Bearer {RENDER_TOKEN}")
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, context=ctx) as r:
        deploys = json.loads(r.read().decode())
        print(f"Latest 3 Deploys:")
        for d in deploys[:3]:
            dp = d.get("deployment", {})
            print(f"- ID: {dp.get('id')}, Status: {dp.get('status')}, Commit: {dp.get('commit', {}).get('id')}")

if __name__ == "__main__":
    get_logs()
