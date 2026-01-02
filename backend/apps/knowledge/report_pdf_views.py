from django.http import HttpResponse
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from weasyprint import HTML

from .models import Report, ReportFinding


@login_required
def report_pdf(request, report_id):
    report = Report.objects.get(id=report_id)
    findings = ReportFinding.objects.filter(report=report)

    severity_counts = {
        "critical": findings.filter(severity="CRITICAL").count(),
        "high": findings.filter(severity="HIGH").count(),
        "medium": findings.filter(severity="MEDIUM").count(),
        "low": findings.filter(severity="LOW").count(),
    }

    context = {
        "report": {
            "client_name": report.client_name,
            "application_name": report.application_name,
            "report_type": report.report_type,
            "report_date": f"{report.start_date} to {report.end_date}",
            "prepared_by": report.prepared_by,
        },
        "summary": {"severity": severity_counts},
        "findings": findings,
    }

    html_string = render_to_string("reports/cover.html", context)

    pdf = HTML(
        string=html_string,
        base_url=request.build_absolute_uri("/")
    ).write_pdf()

    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = (
        f'inline; filename="VAPT_Report_{report.client_name}.pdf"'
    )

    return response
