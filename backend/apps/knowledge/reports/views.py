from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from .pdf_reportlab.build import build_report
import tempfile


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def report_preview(request, report_id):
    data = get_report_data(report_id)

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    build_report(tmp.name, data)

    with open(tmp.name, "rb") as f:
        return HttpResponse(f.read(), content_type="application/pdf")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def report_pdf(request, report_id):
    data = get_report_data(report_id)

    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    build_report(tmp.name, data)

    response = HttpResponse(open(tmp.name, "rb").read(), content_type="application/pdf")
    response["Content-Disposition"] = f'attachment; filename="VAPT_Report_{report_id}.pdf"'
    return response

def get_report_data(report_id):
    # Later we pull from DB.
    return {
        "enterprise": "ABC.COM",
        "pt_date": "Jan 2026",
        "conducted_by": "Cyber Team",
        "version": "1.0",
        "assessee": "ABC Corp",
        "assessor": "John",
        "reviewer": "Jane",
        "approved": "CTO",
        "total_pages": 8,
    }
