import urllib.request
import time
import ssl

# Your backend ping URL
URL = "https://hotel-management-backend-2xln.onrender.com/api/ping"
INTERVAL = 300 # Ping every 5 minutes (300 seconds)
ctx = ssl.create_default_context()

def stay_awake():
    print(f"Stay-Awake script started. Pinging {URL} every {INTERVAL}s...")
    print("Press Ctrl+C to stop.")
    while True:
        try:
            req = urllib.request.Request(URL)
            with urllib.request.urlopen(req, context=ctx, timeout=10) as r:
                print(f"[{time.strftime('%H:%M:%S')}] Ping Successful: {r.status}")
        except Exception as e:
            print(f"[{time.strftime('%H:%M:%S')}] Ping Failed: {e}")
        
        time.sleep(INTERVAL)

if __name__ == "__main__":
    stay_awake()
