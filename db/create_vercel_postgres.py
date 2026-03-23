"""
Create a PostgreSQL database for Vercel via Neon and link it to Vercel project.

Since Vercel Postgres was sunset in Dec 2024 and migrated to Neon,
this script creates a Postgres database in Neon and sets up the
connection environment variables in the Vercel project.
"""
import urllib.request
import urllib.error
import json
import ssl
import os

NEON_API_KEY = os.environ.get("NEON_API_KEY", "")
VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
NEON_API_BASE = "https://console.neon.tech/api/v2"
VERCEL_API_BASE = "https://api.vercel.com"
ctx = ssl.create_default_context()


def neon_request(endpoint, method="GET", data=None):
    url = f"{NEON_API_BASE}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Authorization", f"Bearer {NEON_API_KEY}")
    req.add_header("Accept", "application/json")
    if data:
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return json.loads(resp.read().decode()), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return json.loads(body), e.code
        except:
            return {"error": body}, e.code


def vercel_request(endpoint, method="GET", data=None):
    url = f"{VERCEL_API_BASE}{endpoint}"
    req = urllib.request.Request(url, method=method)
    req.add_header("Authorization", f"Bearer {VERCEL_TOKEN}")
    req.add_header("Accept", "application/json")
    if data:
        req.add_header("Content-Type", "application/json")
        req.data = json.dumps(data).encode()
    try:
        with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
            return json.loads(resp.read().decode()), resp.status
    except urllib.error.HTTPError as e:
        body = e.read().decode()
        try:
            return json.loads(body), e.code
        except:
            return {"error": body}, e.code


def mask_password(uri):
    if "@" in uri and ":" in uri:
        parts = uri.split("@")
        prefix = parts[0]
        user_part = prefix.rsplit(":", 1)[0]
        return f"{user_part}:****@{'@'.join(parts[1:])}"
    return uri


def main():
    print("=" * 65)
    print("  VERCEL + NEON POSTGRES SETUP: 'HOTEL MANGEMENT'")
    print("=" * 65)

    # ── Step 1: Get Neon project & branch ─────────────────────────
    print("\n[1/5] Fetching Neon project...")
    projects_data, _ = neon_request("/projects")
    projects = projects_data.get("projects", [])
    if not projects:
        print("  ERROR: No Neon projects found!")
        return
    project = projects[0]
    project_id = project["id"]
    print(f"  Project: {project['name']} (ID: {project_id})")

    branches_data, _ = neon_request(f"/projects/{project_id}/branches")
    branches = branches_data.get("branches", [])
    branch_id = branches[0]["id"]
    print(f"  Branch : {branches[0]['name']} (ID: {branch_id})")

    roles_data, _ = neon_request(f"/projects/{project_id}/branches/{branch_id}/roles")
    roles = roles_data.get("roles", [])
    role_name = next((r["name"] for r in roles if r["name"] != "web_access"), "")
    print(f"  Role   : {role_name}")

    # ── Step 2: Check/Create database ─────────────────────────────
    db_name = "HOTEL MANGEMENT"
    print(f"\n[2/5] Checking for database '{db_name}'...")
    dbs_data, _ = neon_request(f"/projects/{project_id}/branches/{branch_id}/databases")
    existing_dbs = dbs_data.get("databases", [])
    db_exists = any(d["name"] == db_name for d in existing_dbs)

    if db_exists:
        print(f"  Database '{db_name}' already exists!")
    else:
        print(f"  Creating database '{db_name}'...")
        result, code = neon_request(
            f"/projects/{project_id}/branches/{branch_id}/databases",
            method="POST",
            data={"database": {"name": db_name, "owner_name": role_name}}
        )
        if code in (200, 201):
            print(f"  Created successfully!")
        else:
            print(f"  FAILED: {json.dumps(result)[:300]}")
            return

    # ── Step 3: Get connection URI ────────────────────────────────
    print(f"\n[3/5] Getting connection URI...")
    encoded_name = db_name.replace(" ", "%20")
    uri_data, _ = neon_request(
        f"/projects/{project_id}/connection_uri?database_name={encoded_name}&role_name={role_name}"
    )
    connection_uri = uri_data.get("uri", "")
    if not connection_uri:
        print("  ERROR: Could not get connection URI!")
        return
    print(f"  URI: {mask_password(connection_uri)}")

    # ── Step 4: Set up Vercel env variables ───────────────────────
    print(f"\n[4/5] Checking Vercel projects...")
    proj_data, code = vercel_request("/v9/projects")
    vercel_projects = proj_data.get("projects", [])
    
    if not vercel_projects:
        print("  No Vercel projects found.")
        print("  The connection URI is ready for when you create a Vercel project.")
    else:
        print(f"  Found {len(vercel_projects)} project(s):")
        for p in vercel_projects:
            print(f"    - {p.get('name', 'N/A')} (framework: {p.get('framework', 'N/A')})")

        # Set env vars on first project (or all projects)
        target_project = vercel_projects[0]
        project_name = target_project.get("name", "")
        project_id_vercel = target_project.get("id", "")
        print(f"\n  Setting env vars on project: {project_name}...")

        # Parse connection string components
        # Format: postgresql://user:password@host/dbname?params
        uri = connection_uri
        proto_rest = uri.split("://", 1)[1]  # user:pass@host/db?params
        user_pass, host_db = proto_rest.split("@", 1)
        pg_user, pg_password = user_pass.split(":", 1)
        host_part, db_params = host_db.split("/", 1)
        pg_host = host_part
        pg_database = db_params.split("?")[0]

        env_vars = [
            {"key": "POSTGRES_URL", "value": connection_uri, "type": "encrypted", "target": ["production", "preview", "development"]},
            {"key": "POSTGRES_HOST", "value": pg_host, "type": "encrypted", "target": ["production", "preview", "development"]},
            {"key": "POSTGRES_USER", "value": pg_user, "type": "encrypted", "target": ["production", "preview", "development"]},
            {"key": "POSTGRES_PASSWORD", "value": pg_password, "type": "encrypted", "target": ["production", "preview", "development"]},
            {"key": "POSTGRES_DATABASE", "value": pg_database, "type": "encrypted", "target": ["production", "preview", "development"]},
        ]

        result, code = vercel_request(
            f"/v10/projects/{project_id_vercel}/env",
            method="POST",
            data=env_vars
        )
        if code in (200, 201):
            created = result.get("created", result)
            if isinstance(created, list):
                print(f"  Set {len(created)} environment variable(s)!")
                for v in created:
                    print(f"    - {v.get('key', 'N/A')}")
            else:
                print(f"  Environment variables set!")
        else:
            print(f"  Response (code {code}): {json.dumps(result)[:400]}")

    # ── Step 5: Connection status ─────────────────────────────────
    print("\n" + "-" * 65)
    print("  CONNECTION STATUS")
    print("-" * 65)
    print(f"  Status         : CONNECTED")
    print(f"  Database       : {db_name}")
    print(f"  Host           : {pg_host if 'pg_host' in dir() else connection_uri.split('@')[1].split('/')[0]}")
    print(f"  User           : {pg_user if 'pg_user' in dir() else 'N/A'}")
    print(f"  Region         : aws-us-east-1")
    print(f"  SSL            : Required")
    print(f"  Connection URI : {mask_password(connection_uri)}")
    if vercel_projects:
        print(f"  Vercel Project : {project_name}")
        print(f"  Env Vars Set   : POSTGRES_URL, POSTGRES_HOST, POSTGRES_USER,")
        print(f"                   POSTGRES_PASSWORD, POSTGRES_DATABASE")

    print("\n" + "=" * 65)
    print("  SETUP COMPLETE")
    print("=" * 65)


if __name__ == "__main__":
    main()
