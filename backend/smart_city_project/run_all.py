import subprocess
import sys
from pathlib import Path

# Project root
ROOT = Path(__file__).resolve().parent

def run_step(step_name, script_path):
    print(f"\n>>> Running {step_name}...")
    # Use the same python interpreter as the current one
    result = subprocess.run([sys.executable, str(ROOT / script_path)], cwd=ROOT)
    if result.returncode != 0:
        print(f"!!! Error in {step_name}. Stopping pipeline.")
        sys.exit(1)

def main():
    print("========================================")
    print("   CYPHER AIR - FULL PIPELINE")
    print("========================================")

    # 1. Fetch real API data
    run_step("STEP 1: API Data Fetch", "pipeline/step1_fetch.py")

    # 2. Industrial Emission Data
    run_step("STEP 2: Industrial Emissions", "pipeline/step2_industrial.py")

    # 3. Synthetic Sensor Data
    run_step("STEP 3: Synthetic Data", "pipeline/step3_synthetic.py")

    # 4. Data Merging
    run_step("STEP 4: Data Merging", "pipeline/step4_merge.py")

    # 5. XGBoost Training
    run_step("STEP 5: Model Training", "pipeline/step7_model.py")

    # 6. Spatial Kriging
    run_step("STEP 6: Spatial Kriging", "pipeline/step8_kriging.py")

    print("\n========================================")
    print("V ALL STEPS COMPLETED SUCCESSFULLY!")
    print("========================================")

if __name__ == "__main__":
    main()