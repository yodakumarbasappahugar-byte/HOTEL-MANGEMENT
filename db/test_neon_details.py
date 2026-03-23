"""Get Neon database details and connection URI."""
import urllib.request
import json
import ssl
import os

NEON_API_KEY = os.environ.get("NEON_API_KEY", "")
PROJECT_ID = "misty-frost-77876013"
ctx = ssl.create_default_context()

def api_get(path):
    req = urllib.request.Request(f"https://console.neon.tech/api/v2{path}")
    req.add_header("Authorization", f"Bearer {NEON_API_KEY}")
    req.add_header("Accept", "application/json")
    with urllib.request.urlopen(req, context=ctx, timeout=15) as r:
        return json.loads(r.read().decode())

# Get databases
print("Fetching databases...")
dbs = api_get(f"/projects/{PROJECT_ID}/branches/br-billowing-lab-ada5dr20/databases")
print(json.dumps(dbs, indent=2))

# Get roles
print("\nFetching roles...")
roles = api_get(f"/projects/{PROJECT_ID}/branches/br-billowing-lab-ada5dr20/roles")
print(json.dumps(roles, indent=2))

# Get connection URI with database_name
db_names = [d["name"] for d in dbs.get("databases", [])]
if db_names:
    db_name = db_names[0]
    role_name = roles.get("roles", [{}])[0].get("name", "")
    print(f"\nFetching connection URI for db='{db_name}', role='{role_name}'...")
    uri_data = api_get(f"/projects/{PROJECT_ID}/connection_uri?database_name={db_name}&role_name={role_name}")
    uri = uri_data.get("uri", "")
    # Mask password
    if "@" in uri:
        parts = uri.split("@")
        prefix = parts[0]
        user_part = prefix.rsplit(":", 1)[0]
        print(f"Connection URI: {user_part}:****@{'@'.join(parts[1:])}")
    print("\n✅ Neon connection is working!")
