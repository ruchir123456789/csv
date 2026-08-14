import sys
import os
import io
import pandas as pd
from fastapi.testclient import TestClient

# Add current directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from main import app

def test_backend():
    with TestClient(app) as client:
        print("1. Testing Root & Healthcheck...")
        res = client.get("/")
        assert res.status_code == 200, f"Root failed: {res.text}"
        print("[PASS] Root endpoint working:", res.json()["service"])

        print("\n2. Testing Single Item Web Verification (/api/csv/verify/single)...")
        single_res = client.post(
            "/api/csv/verify/single",
            json={
                "brand": "Samsung",
                "model_code": "AR18CY5A",
                "description": "1.5 Ton 5 Star Inverter Split AC"
            }
        )
        assert single_res.status_code == 200, f"Single verify failed: {single_res.text}"
        single_data = single_res.json()
        print(f"[PASS] Single Item Verified:")
        print(f"  * Brand: {single_data['brand']}, Model: {single_data['model_code']}")
        print(f"  * Closeness Score: {single_data['web_closeness_score']}")
        print(f"  * Status: {single_data['verification_status']}")
        print(f"  * Insights: {single_data['spec_verification_insights']}")

        print("\n3. Testing CSV Dataset Web Cross-Verification & Closeness Engine (/api/csv/verify)...")
        user_screenshot_csv = (
            "manufactu,manufactu,brand,description\n"
            "Samsung,AR18CY5A,Samsung,1.5 Ton Smart Inverter AC\n"
            "LG,OLED55C3,LG,55 inch Smart OLED TV\n"
            "Philips,AC1711/30,Philips,Smart Air Purifier Series 1000i\n"
            "Whirlpool,IF INV CNV,Whirlpool,265 L Frost Free Refrigerator\n"
            "Panasonic,NN-ST34H,Panasonic,25 L Solo Microwave Oven\n"
            "Racold,ECO 15L,Racold,15 L Smart Geyser Water Heater\n"
            "Godrej,Eon Vogue,Godrej,236 L Frost Free Refrigerator\n"
            "Havells,Stealth Air,Havells,Smart Ceiling Fan\n"
            "Sony,SRS-XB100,Sony,Portable Wireless Bluetooth Speaker\n"
            "Bosch,WAK24264,Bosch,7 kg Fully Automatic Front Load Washing Machine\n"
        )
        
        file_bytes = io.BytesIO(user_screenshot_csv.encode("utf-8"))
        verify_res = client.post(
            "/api/csv/verify",
            files={"file": ("dataset_to_verify.csv", file_bytes, "text/csv")}
        )
        assert verify_res.status_code == 200, f"CSV verify failed: {verify_res.text}"
        verify_data = verify_res.json()
        insights = verify_data["dataset_insights"]
        file_id = verify_data["file_id"]

        print(f"[PASS] Dataset Verification & Closeness Audit Complete! File ID: {file_id}")
        print(f"  * Average Closeness to Real Web Data: {insights['average_closeness_score']}%")
        print(f"  * Overall Accuracy Grade: {insights['accuracy_grade']}")
        print(f"  * High Confidence Items: {insights['high_confidence_items']} / {insights['total_items_checked']}")
        print(f"  * Dataset Verdict: {insights['overall_dataset_verdict']}")
        print(f"  * Download URL: {verify_data['download_url']}")

        print("\n4. Inspecting Row-by-Row Closeness Insights:")
        for idx, row in enumerate(verify_data["preview_rows"], 1):
            score = str(row.get('web_closeness_score', ''))
            status = str(row.get('verification_status', ''))
            title = str(row.get('verified_market_title', '')).encode('ascii', 'replace').decode('ascii')
            notes = str(row.get('spec_verification_insights', '')).encode('ascii', 'replace').decode('ascii')
            print(f"  [Item {idx}] {row.get('manufactu')} -> Closeness: {score} | Status: {status}")
            print(f"     Title: {title}")
            print(f"     Notes: {notes}")

        print("\n5. Testing Download of Verified CSV (/api/csv/{file_id}/download-verified)...")
        download_res = client.get(f"/api/csv/{file_id}/download-verified")
        assert download_res.status_code == 200, f"Download failed: {download_res.text}"
        verified_text = download_res.text
        assert "web_closeness_score" in verified_text
        assert "verification_status" in verified_text
        assert "spec_verification_insights" in verified_text
        print(f"[PASS] Downloaded Verified CSV successfully ({len(verified_text)} bytes) with closeness columns!")

        print("\n============================================================")
        print("ALL DUCKDUCKGO WEB VERIFICATION & CLOSENESS TESTS PASSED 100%!")
        print("============================================================")

if __name__ == "__main__":
    test_backend()
