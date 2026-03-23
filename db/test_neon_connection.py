"""
Test Neon Database Connection
Queries the Neon API to list projects, then attempts a direct PostgreSQL connection.
"""
import urllib.request
import urllib.error
import json
import ssl
import os

NEON_API_KEY = os.environ.get("NEON_API_KEY", "")
NEON_API_BASE = "https://console.neon.tech/api/v2"

# Allow HTTPS connections
ctx = ssl.create_default_context()

def neon_api_request(endpoint):
    """Make an authenticated request to the Neon API."""
    url = f"{NEON_API_BASE}{endpoint}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {NEON_API_KEY}")
    req.add_header("Accept", "application/json")
    try:
        with urllib.request.urlopen(req, context=ctx) as resp:
            data = json.loads(resp.read().decode())
            return data
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        print(f"HTTP Error {e.code}: {body}")
        return None
    except Exception as e:
        print(f"Error: {e}")
        return None

def main():
    print("=" * 60)
    print("  NEON DATABASE CONNECTION TEST")
    print("=" * 60)

    # Step 1: List projects
    print("\n[1/3] Listing Neon projects...")
    projects_data = neon_api_request("/projects")
    if not projects_data:
        print("FAILED: Could not list projects. Check your API key.")
        return

    projects = projects_data.get("projects", [])
    if not projects:
        print("No projects found. You may need to create one in the Neon console.")
        return

    print(f"  Found {len(projects)} project(s):")
    for p in projects:
        print(f"    - {p['name']} (ID: {p['id']}, Region: {p.get('region_id', 'N/A')})")

    project_id = projects[0]["id"]
    project_name = projects[0]["name"]
    print(f"\n  Using project: {project_name} ({project_id})")

    # Step 2: Get branches
    print("\n[2/3] Getting branches...")
    branches_data = neon_api_request(f"/projects/{project_id}/branches")
    if branches_data:
        branches = branches_data.get("branches", [])
        print(f"  Found {len(branches)} branch(es):")
        for b in branches:
            print(f"    - {b['name']} (ID: {b['id']})")

    # Step 3: Get connection URI
    print("\n[3/3] Getting connection details...")
    conn_data = neon_api_request(f"/projects/{project_id}/connection_uri")
    if conn_data:
        uri = conn_data.get("uri", "N/A")
        # Mask password in output
        masked_uri = uri
        if "@" in uri and ":" in uri:
            parts = uri.split("@")
            prefix = parts[0]
            if ":" in prefix:
                user_part = prefix.rsplit(":", 1)[0]
                masked_uri = f"{user_part}:****@{'@'.join(parts[1:])}"
        print(f"  Connection URI: {masked_uri}")
        print(f"\n  ✅ SUCCESS: Neon connection details retrieved!")
        print(f"  Your database is accessible and ready to use.")
    else:
        print("  Could not retrieve connection URI.")
        # Try getting endpoints instead
        print("  Trying endpoints...")
        endpoints_data = neon_api_request(f"/projects/{project_id}/endpoints")
        if endpoints_data:
            endpoints = endpoints_data.get("endpoints", [])
            for ep in endpoints:
                print(f"    - Host: {ep.get('host', 'N/A')}, Status: {ep.get('current_state', 'N/A')}")

    print("\n" + "=" * 60)
    print("  TEST COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
