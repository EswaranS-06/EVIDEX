from django.shortcuts import render

def test_report_preview(request):
    context = {
        "report": {
            "client_name": "ACME Corp",
            "application_name": "Customer Portal",
            "report_type": "Web Application Security Testing",
            "report_date": "December 2025",
            "prepared_by": "EVIDEX Security Team",
        },
        "summary": {
            "application_url": "https://example.com",
            "testing_scope": "OWASP + Manual Testing",
            "severity": {
                "critical": 1,
                "high": 2,
                "medium": 1,
                "low": 1,
            },
        },
        "findings": [
            {
                "title": "Account Takeover via Password Reset",
                "severity": "CRITICAL",
                "description": "Password reset token is predictable.",
                "impact": "Full account compromise.",
                "remediation": "Use random, time‑bound tokens.",
                "evidence": [],
            },
            {
                "title": "Blind SQL Injection",
                "severity": "HIGH",
                "description": "Unsanitized input in search API.",
                "impact": "Database data exposure.",
                "remediation": "Use parameterized queries.",
                "evidence": [],
            },
            {
                "title": "Verbose Error Messages",
                "severity": "LOW",
                "description": "Stack traces exposed.",
                "impact": "Information disclosure.",
                "remediation": "Disable debug messages.",
                "evidence": [],
            },
        ],
        "action_plan": {
            "Critical": ["Fix password reset immediately"],
            "High": ["Sanitize all DB inputs"],
            "Low": ["Disable verbose errors"],
        },
    }

    return render(request, "reports/cover.html", context)
