from django.http import HttpResponse
from django.template.loader import render_to_string


def test_pdf(request):
    # Import WeasyPrint ONLY when this view is called
    from weasyprint import HTML

    context = {
        "report": {
            "client_name": "ACME Corp",
            "application_name": "Customer Portal",
            "report_type": "Web Application Security Testing",
            "report_date": "January 2026",
            "prepared_by": "EVIDEX Security Team",
        }
    }

    html = render_to_string("reports/cover.html", context)
    pdf = HTML(string=html).write_pdf()

    response = HttpResponse(pdf, content_type="application/pdf")
    response["Content-Disposition"] = "inline; filename=report.pdf"
    return response
