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
            # Build a descriptive filename: VAPT_ClientName_AppName_Feb2026.pdf
            safe_client = (report.client_name or "").replace(" ", "_").strip("_")
            safe_app = (report.application_name or "").replace(" ", "_").strip("_")
            date_part = report.created_at.strftime("%b%Y") if report.created_at else ""
            
            parts = ["VAPT"]
            if safe_client:
                parts.append(safe_client)
            if safe_app:
                parts.append(safe_app)
            if date_part:
                parts.append(date_part)
            filename = "_".join(parts) + ".pdf" if len(parts) > 1 else "VAPT_Report.pdf"
            
            response = HttpResponse(f.read(), content_type="application/pdf")
            # Use 'attachment' for forced download, 'inline' for preview
            if request.query_params.get("download") == "1":
                response["Content-Disposition"] = f'attachment; filename="{filename}"'
            else:
                response["Content-Disposition"] = f'inline; filename="{filename}"'
            response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
            response["Pragma"] = "no-cache"
            response["Expires"] = "0"
            # Allow frontend to read the Content-Disposition header
            response["Access-Control-Expose-Headers"] = "Content-Disposition"
            return response
