from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.conf import settings

from apps.knowledge.models import Report, ReportFinding


@login_required
def report_pdf(request, report_id):
    # Lazy import (VERY IMPORTANT for Windows + GTK)
    from weasyprint import HTML
    

    try:
        report = Report.objects.get(id=report_id)
    except Report.DoesNotExist:
        raise Http404("Report not found")

    findings = ReportFinding.objects.filter(report=report).prefetch_related(
        "evidences"  # IMPORTANT for evidence images
    )

    # Severity aggregation
    severity_counts = {
        "critical": findings.filter(severity="CRITICAL").count(),
        "high": findings.filter(severity="HIGH").count(),
        "medium": findings.filter(severity="MEDIUM").count(),
        "low": findings.filter(severity="LOW").count(),
    }

    # Context passed DIRECTLY (no nested dicts for report)
    context = {
        "report": report,
        "summary": {
            "severity": severity_counts
        },
        "findings": findings,
    }

    # Render HTML
    html_string = render_to_string(
        "reports/cover.html",
        context,
        request=request  # IMPORTANT for static/media resolution
    )

    # Generate PDF
    pdf = HTML(
        string=html_string,
        base_url=request.build_absolute_uri("/")  # 🔑 CRITICAL FOR IMAGES
    ).write_pdf()

    # Return response
    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = (
        f'inline; filename="VAPT_Report_{report.client_name}.pdf"'
    )



    return response
