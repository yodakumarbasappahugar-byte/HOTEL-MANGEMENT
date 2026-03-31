import urllib.request
import json

def seed_rooms():
    url = 'https://hotel-management-backend-2xln.onrender.com/api/rooms/seed'
    try:
        req = urllib.request.Request(url, method='POST')
        with urllib.request.urlopen(req) as response:
            data = json.load(response)
            print(f"Success: {data}")
    except Exception as e:
        print(f"Error seeding rooms: {e}")

if __name__ == "__main__":
    seed_rooms()
