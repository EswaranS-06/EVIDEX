from django.http import HttpResponse, Http404
from apps.knowledge.models import Report
from .pdf_reportlab.build import build_report
import tempfile

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
# from rest_framework.permissions import IsAuthenticated    <------- Enable JWT auth later
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes


class ReportPDFView(APIView):
    # authentication_classes = [JWTAuthentication]     <------- Enable JWT auth later
    # permission_classes = [IsAuthenticated]    <------- Enable JWT auth later
    # Temporarily disable JWT authentication (allow anonymous access)
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="download_report_pdf",
        summary="Export Report as PDF",
        description="Generates and exports a complete security assessment report as a PDF file.",
        tags=["Reports"],
        responses={
            200: OpenApiTypes.BINARY,
            401: {"description": "Unauthorized - No valid JWT token"},
            404: {"description": "Report not found"},
        },
    )
    def get(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            raise Http404("Report not found")

        data = {
            "enterprise": report.application_name,
            "pt_date": report.created_at.strftime("%b %Y") if report.created_at else "N/A",
            "conducted_by": report.created_by if hasattr(report, "created_by") else "Cyber Team",
            "version": report.version if hasattr(report, "version") else "1.0",
            "assessee": report.client_name,
            "assessor": report.created_by if hasattr(report, "created_by") else "John",
            "reviewer": "Jane",
            "approved": "CTO",
            "total_pages": 8,
            "start_date": report.start_date.strftime("%d-%b-%Y") if report.start_date else "",
            "end_date": report.end_date.strftime("%d-%b-%Y") if report.end_date else "",
            "application_name": report.application_name,
            "created_by": report.created_by,
        }

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        build_report(tmp.name, data, report.id)

        with open(tmp.name, "rb") as f:
            response = HttpResponse(f.read(), content_type="application/pdf")
            response["Content-Disposition"] = f'inline; filename="VAPT_{report.client_name}.pdf"'
            response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"
            return response
