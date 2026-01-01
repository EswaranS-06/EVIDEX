from django.http import HttpResponse
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required


@login_required
def report_preview(request):
    """
    HTML preview of the report
    (No PDF, no WeasyPrint)
    """

    # Temporary mock data (later comes from DB)
    context = {
        "report": {
            "client_name": "ACME Corp",
            "application_name": "Customer Portal",
            "report_type": "Web Application Security Testing",
            "report_date": "January 2026",
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
                "description": "Predictable reset token.",
                "impact": "Full account compromise.",
                "remediation": "Use time‑bound random tokens.",
                "evidence": [],
            },
            {
                "title": "Blind SQL Injection",
                "severity": "HIGH",
                "description": "Unsanitized input.",
                "impact": "Data exposure.",
                "remediation": "Use prepared statements.",
                "evidence": [],
            },
            {
                "title": "Verbose Error Messages",
                "severity": "LOW",
                "description": "Stack traces exposed.",
                "impact": "Information disclosure.",
                "remediation": "Disable debug mode.",
                "evidence": [],
            },
        ],
        "action_plan": {
            "Critical": ["Fix password reset immediately"],
            "High": ["Sanitize all DB inputs"],
            "Low": ["Disable verbose errors"],
        },
    }

    html = render_to_string("reports/cover.html", context)
    return HttpResponse(html)
