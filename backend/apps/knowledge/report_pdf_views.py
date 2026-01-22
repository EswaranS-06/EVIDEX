from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.conf import settings
import os
from apps.knowledge.models import Report, ReportFinding

@login_required
def report_pdf(request, report_id):
    from weasyprint import HTML

    try:
        report = Report.objects.get(id=report_id)
    except Report.DoesNotExist:
        raise Http404("Report not found")

    findings = (
        ReportFinding.objects
        .filter(report=report)
        .select_related("vulnerability")
        .prefetch_related("evidences")
    )

    # ----------------------------
    # Severity aggregation
    # ----------------------------
    severity_counts = {
        "CRITICAL": 0,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0,
    }

    for f in findings:
        if f.final_severity in severity_counts:
            severity_counts[f.final_severity] += 1

    # ----------------------------
    # Context
    # ----------------------------
    context = {
        "report": report,
        "summary": {
            "severity": {
                "critical": severity_counts["CRITICAL"],
                "high": severity_counts["HIGH"],
                "medium": severity_counts["MEDIUM"],
                "low": severity_counts["LOW"],
            }
        },
        "findings": findings,
        "is_pdf": True,
    }

    html_string = render_to_string(
        "reports/cover.html",
        context,
        request=request
    )

    # ----------------------------
    # 🔑 THIS IS THE REAL FIX
    # ----------------------------
    # base_url MUST be MEDIA_ROOT parent
    base_url = settings.MEDIA_ROOT

    pdf = HTML(
        string=html_string,
        base_url=base_url
    ).write_pdf(
        presentational_hints=True,
    enable_local_file_access=True
    )

    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = (
        f'inline; filename="VAPT_Report_{report.client_name}.pdf"'
    )

    return response
