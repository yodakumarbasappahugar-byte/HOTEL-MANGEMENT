import os
import subprocess
import sys
import json
import urllib.request
import ssl

def ensure_psycopg2():
    try:
        import psycopg2
    except ImportError:
        print("Installing psycopg2-binary...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
        import psycopg2

def get_connection_uri():
    NEON_API_KEY = os.environ.get("NEON_API_KEY", "napi_jvvtj1z442vbalf4k7qk1niptep7qaqlb7z165vmn0ld1715ei34psl0edjdlmuu")
    PROJECT_ID = "misty-frost-77876013"
    ctx = ssl.create_default_context()
    
    def api_get(path):
        req = urllib.request.Request(f"https://console.neon.tech/api/v2{path}")
        req.add_header("Authorization", f"Bearer {NEON_API_KEY}")
        req.add_header("Accept", "application/json")
        with urllib.request.urlopen(req, context=ctx, timeout=15) as r:
            return json.loads(r.read().decode())

    roles = api_get(f"/projects/{PROJECT_ID}/branches/br-billowing-lab-ada5dr20/roles")
    role_name = roles.get("roles", [{}])[0].get("name", "")
    
    db_name = "HOTEL MANGEMENT".replace(" ", "%20")
    uri_data = api_get(f"/projects/{PROJECT_ID}/connection_uri?database_name={db_name}&role_name={role_name}")
    return uri_data.get("uri", "")

def main():
    ensure_psycopg2()
    import psycopg2

    print("Fetching connection URI...")
    uri = get_connection_uri()
    if not uri:
        print("Failed to get connection URI")
        return

    print("Connecting to database...")
    try:
        conn = psycopg2.connect(uri)
        conn.autocommit = True
        cur = conn.cursor()

        # Create users table
        print("Creating users table...")
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                email VARCHAR(100) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            )
        """)
        print("Users table created successfully!")

        cur.close()
        conn.close()
    except Exception as e:
        print(f"Error creating table: {e}")

if __name__ == "__main__":
    main()
