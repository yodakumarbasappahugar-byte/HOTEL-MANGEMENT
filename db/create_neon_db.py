"""Create a PostgreSQL database named 'HOTEL MANGEMENT' in Neon and verify connection."""
import urllib.request
import urllib.error
import json
import ssl
import os

NEON_API_KEY = os.environ.get("NEON_API_KEY", "")
NEON_API_BASE = "https://console.neon.tech/api/v2"
ctx = ssl.create_default_context()

def api_request(endpoint, method="GET", data=None):
    """Make an authenticated request to the Neon API."""
    url = f"{NEON_API_BASE}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Authorization", f"Bearer {NEON_API_KEY}")
    req.add_header("Accept", "application/json")
    if data:
        req.add_header("Content-Type", "application/json")
        body = json.dumps(data).encode()
        req.data = body
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return json.loads(resp.read().decode()), resp.status
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        print(f"  HTTP Error {e.code}: {err_body}")
        return None, e.code
    except Exception as e:
        print(f"  Error: {e}")
        return None, 0

def main():
    print("=" * 60)
    print("  NEON DB SETUP: Creating 'HOTEL MANGEMENT' Database")
    print("=" * 60)

    # Step 1: Get the existing project
    print("\n[1/4] Fetching Neon projects...")
    projects_data, status = api_request("/projects")
    if not projects_data:
        print("  FAILED: Could not list projects. Check your NEON_API_KEY.")
        return

    projects = projects_data.get("projects", [])
    if not projects:
        print("  No projects found. Creating a new project is needed.")
        return

    project = projects[0]
    project_id = project["id"]
    project_name = project["name"]
    print(f"  Project: {project_name} (ID: {project_id})")
    print(f"  Region : {project.get('region_id', 'N/A')}")

    # Step 2: Get branches
    print("\n[2/4] Fetching branches...")
    branches_data, _ = api_request(f"/projects/{project_id}/branches")
    branches = branches_data.get("branches", []) if branches_data else []
    if not branches:
        print("  No branches found!")
        return

    branch = branches[0]
    branch_id = branch["id"]
    print(f"  Branch : {branch['name']} (ID: {branch_id})")

    # Step 3: Get existing roles
    print("\n[3/4] Fetching roles...")
    roles_data, _ = api_request(f"/projects/{project_id}/branches/{branch_id}/roles")
    roles = roles_data.get("roles", []) if roles_data else []
    role_name = ""
    for r in roles:
        if r.get("name") != "web_access":
            role_name = r["name"]
            break
    print(f"  Role   : {role_name}")

    # Step 4: Check existing databases and create if needed
    print("\n[4/4] Checking existing databases...")
    dbs_data, _ = api_request(f"/projects/{project_id}/branches/{branch_id}/databases")
    existing_dbs = dbs_data.get("databases", []) if dbs_data else []
    print(f"  Existing databases: {[d['name'] for d in existing_dbs]}")

    db_name = "HOTEL MANGEMENT"
    db_exists = any(d["name"] == db_name for d in existing_dbs)

    if db_exists:
        print(f"\n  Database '{db_name}' already exists!")
    else:
        print(f"\n  Creating database '{db_name}'...")
        create_data = {
            "database": {
                "name": db_name,
                "owner_name": role_name
            }
        }
        result, code = api_request(
            f"/projects/{project_id}/branches/{branch_id}/databases",
            method="POST",
            data=create_data
        )
        if result:
            db_info = result.get("database", result)
            print(f"  Created successfully!")
            print(f"    Name  : {db_info.get('name', 'N/A')}")
            print(f"    Owner : {db_info.get('owner_name', 'N/A')}")
            print(f"    ID    : {db_info.get('id', 'N/A')}")
        else:
            print(f"  FAILED to create database (code: {code})")
            return

    # Step 5: Get connection URI
    print("\n" + "-" * 60)
    print("  CONNECTION STATUS")
    print("-" * 60)
    uri_data, _ = api_request(
        f"/projects/{project_id}/connection_uri?database_name={db_name.replace(' ', '%20')}&role_name={role_name}"
    )
    if uri_data:
        uri = uri_data.get("uri", "")
        # Mask password for display
        if "@" in uri and ":" in uri:
            parts = uri.split("@")
            prefix = parts[0]
            user_part = prefix.rsplit(":", 1)[0]
            host_part = "@".join(parts[1:])
            masked_uri = f"{user_part}:****@{host_part}"
            print(f"  Connection URI : {masked_uri}")
        print(f"  Status         : CONNECTED")
        print(f"  Database       : {db_name}")
        print(f"  Role           : {role_name}")

        # Extract host for display
        if "@" in uri:
            host = uri.split("@")[1].split("/")[0]
            print(f"  Host           : {host}")
    else:
        print("  Could not retrieve connection URI")

    print("\n" + "=" * 60)
    print("  SETUP COMPLETE")
    print("=" * 60)

if __name__ == "__main__":
    main()
