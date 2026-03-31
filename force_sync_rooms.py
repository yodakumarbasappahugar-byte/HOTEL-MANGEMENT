import urllib.request
import json
import time

def sync_data():
    base_url = 'https://hotel-management-backend-2xln.onrender.com/api/rooms'
    
    print("Waiting 60 seconds for Render to redeploy with the new /clear endpoint...")
    # time.sleep(60) # We'll run it and see, maybe it's fast enough. Or we can just try.
    
    try:
        # 1. Clear existing rooms
        print("Clearing existing rooms...")
        clear_req = urllib.request.Request(f"{base_url}/clear", method='POST')
        with urllib.request.urlopen(clear_req) as response:
            print(f"Clear Status: {json.load(response)}")
            
        # 2. Seed with new paths
        print("Seeding with updated paths...")
        seed_req = urllib.request.Request(f"{base_url}/seed", method='POST')
        with urllib.request.urlopen(seed_req) as response:
            print(f"Seed Status: {json.load(response)}")
            
    except Exception as e:
        print(f"Sync failed (Backend might still be deploying): {e}")

if __name__ == "__main__":
    sync_data()
