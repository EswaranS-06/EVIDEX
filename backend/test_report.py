import requests

BASE_URL = "http://127.0.0.1:8000/api"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcyMDMxNTk2LCJpYXQiOjE3Njk0Mzk1OTYsImp0aSI6ImFhZmE3YzMxN2FhNDRkNGE4NGI5ZmU4MjQwOTdiNTMxIiwidXNlcl9pZCI6IjEifQ.NGaVqnnm08ZerLdBGAQv1YsBqM1o9paknYWfw6KyXFo"
HEADERS = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json",
}

def create_report(payload):
    url = f"{BASE_URL}/reports/"
    resp = requests.post(url, json=payload, headers=HEADERS)

    if resp.status_code != 201:
        print("❌ Failed to create report:", resp.status_code, resp.text)
        return None

    data = resp.json()
    print("✅ Created report:", data["id"])
    return data["id"]


def create_finding(report_id, payload):
    url = f"{BASE_URL}/reports/{report_id}/findings/"
    resp = requests.post(url, json=payload, headers=HEADERS)

    if resp.status_code != 201:
        print("❌ Failed to create finding:", resp.status_code, resp.text)
        return

    data = resp.json()
    print("   ➕ Finding created:", data["id"])


# -------------------------
# REPORT PAYLOADS
# -------------------------
report_1 = {
    "client_name": "ACME Corp",
    "application_name": "Customer Portal",
    "target": "acme.com",
    "start_date": "2026-01-25",
    "end_date": "2026-01-31",
    "report_type": "Web Application",
    "status": "Draft",
    "prepared_by": "Pentester",
}

report_2 = {
    "client_name": "Globex Ltd",
    "application_name": "Internal Dashboard",
    "target": "globex.local",
    "start_date": "2026-01-20",
    "end_date": "2026-01-28",
    "report_type": "Web Application",
    "status": "In Progress",
    "prepared_by": "Pentester",
}


# -------------------------
# FINDING TEMPLATES
# -------------------------
findings_report_1 = [
    {
        "vulnerability": 1
    },
    {
        "vulnerability": 2
    },
    {
        "vulnerability": 4
    },
    {
        "vulnerability": 43
    },
    {
        "vulnerability": 13
    },
]

findings_report_2 = [
    {
        "vulnerability": 34
    },
    {
        "vulnerability": 58
    },
    {
        "vulnerability": 92
    },
    {
        "vulnerability": 43
    },
    {
        "vulnerability": 13
    },
]

# -------------------------
# EXECUTION
# -------------------------
if __name__ == "__main__":
    print("🚀 Creating Report 1...")
    report1_id = create_report(report_1)

    if report1_id:
        for f in findings_report_1:
            create_finding(report1_id, f)

    print("\n🚀 Creating Report 2...")
    report2_id = create_report(report_2)

    if report2_id:
        for f in findings_report_2:
            create_finding(report2_id, f)

    print("\n🎯 Done.")
