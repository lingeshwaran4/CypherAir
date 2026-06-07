import time
import subprocess
import os

# Set the interval in seconds (e.g., 3600 seconds = 1 hour)
# Changing it to 3600 for hourly updates
UPDATE_INTERVAL = 3600 

def run_pipeline():
    print(f"\n--- Starting automated data update at {time.ctime()} ---")
    
    try:
        # Run the existing run_all.py script
        import sys
        subprocess.run([sys.executable, "run_all.py"], check=True)
        print(f"--- Data update completed successfully at {time.ctime()} ---")
    except subprocess.CalledProcessError as e:
        print(f"--- Error during data update: {e} ---")

if __name__ == "__main__":
    print(f"Starting pipeline scheduler. The data will auto-update every {UPDATE_INTERVAL // 60} minutes.")
    
    # Run once immediately on startup
    run_pipeline()
    
    # Keep running in a loop
    while True:
        print(f"Sleeping for {UPDATE_INTERVAL // 60} minutes...")
        time.sleep(UPDATE_INTERVAL)
        run_pipeline()
