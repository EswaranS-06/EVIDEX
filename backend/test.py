import requests

BASE_URL = "http://127.0.0.1:8000/api"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzcyMDI3MjI5LCJpYXQiOjE3Njk0MzUyMjksImp0aSI6ImFmODg4OGFmNzJmYzRjNzg4OGU4MDg4MzQxMDNkZmEzIiwidXNlcl9pZCI6IjEifQ.e_niRPWub5m_j0mzpBTlZ7uMLNvIzs03_ocMfvqWNz4"
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
        "final_title": "SQL Injection",
        "final_severity": "CRITICAL",
        "final_description": "Unsanitized input allows SQL injection.",
        "final_impact": "Database compromise.",
        "final_remediation": "Use parameterized queries."
    },
    {
        "final_title": "Stored XSS",
        "final_severity": "HIGH",
        "final_description": "User input rendered without encoding.",
        "final_impact": "Session hijacking.",
        "final_remediation": "Encode output and validate input."
    },
    {
        "final_title": "Broken Authentication",
        "final_severity": "HIGH",
        "final_description": "Weak password policy.",
        "final_impact": "Account takeover.",
        "final_remediation": "Enforce strong password rules."
    },
    {
        "final_title": "IDOR",
        "final_severity": "MEDIUM",
        "final_description": "Insecure object references.",
        "final_impact": "Unauthorized data access.",
        "final_remediation": "Implement proper access control."
    },
    {
        "final_title": "Security Misconfiguration",
        "final_severity": "LOW",
        "final_description": "Verbose error messages.",
        "final_impact": "Information disclosure.",
        "final_remediation": "Disable debug mode."
    },
]

findings_report_2 = [
    {
        "final_title": "CSRF",
        "final_severity": "HIGH",
        "final_description": "Missing CSRF tokens.",
        "final_impact": "Unauthorized actions.",
        "final_remediation": "Add CSRF protection."
    },
    {
        "final_title": "Open Redirect",
        "final_severity": "MEDIUM",
        "final_description": "Unvalidated redirect parameter.",
        "final_impact": "Phishing.",
        "final_remediation": "Validate redirect URLs."
    },
    {
        "final_title": "Information Disclosure",
        "final_severity": "LOW",
        "final_description": "Stack traces exposed.",
        "final_impact": "System info leakage.",
        "final_remediation": "Hide error details."
    },
    {
        "final_title": "Insecure Cookies",
        "final_severity": "LOW",
        "final_description": "Cookies missing Secure flag.",
        "final_impact": "Session theft.",
        "final_remediation": "Set Secure and HttpOnly flags."
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