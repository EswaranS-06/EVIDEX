from django.http import HttpResponse, Http404
from apps.knowledge.models import Report
from .reports.docx_builder.build_docx import build_docx
import tempfile

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes


class ReportDOCXView(APIView):
    # authentication_classes = [JWTAuthentication]     <------- Enable JWT auth later
    # permission_classes = [IsAuthenticated]    <------- Enable JWT auth later
    # Temporarily disable JWT authentication (allow anonymous access)
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="download_report_docx",
        summary="Export Report as DOCX",
        description="Generates and exports the security assessment report as a DOCX file, optionally encrypted with a password.",
        tags=["Reports"],
        request=OpenApiTypes.OBJECT,
        responses={200: OpenApiTypes.BINARY},
    )
    def post(self, request, report_id):

        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            raise Http404("Report not found")

        data = {
            "enterprise": report.client_name,
            "application_name": report.application_name,
            "start_date": report.start_date.strftime("%d-%b-%Y") if report.start_date else "",
            "end_date": report.end_date.strftime("%d-%b-%Y") if report.end_date else "",
            "conducted_by": str(report.created_by) if report.created_by else "Cyber Team",
            "assessee": report.client_name,
            "assessor": str(report.created_by) if report.created_by else "John",
            "reviewed_by": report.reviewed_by,
            "approved_by": report.approved_by,
            "version": "1.0",
            "pt_date": report.created_at.strftime("%b %Y") if report.created_at else "N/A",
            "target": report.target or "",
            "tools_used": report.tools_used or "",
            "test_location": report.test_location or "",
            }

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")

        build_docx(tmp.name, data, report.id)

        password = request.data.get("password", "").strip()

        if password:
            import io
            from msoffcrypto.format.ooxml import OOXMLFile
            
            with open(tmp.name, "rb") as f:
                ooxml_file = OOXMLFile(f)
                encrypted_io = io.BytesIO()
                ooxml_file.encrypt(password, encrypted_io)
                docx_bytes = encrypted_io.getvalue()
        else:
            with open(tmp.name, "rb") as f:
                docx_bytes = f.read()

        response = HttpResponse(
            docx_bytes,
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        )
        response["Content-Disposition"] = f'attachment; filename="VAPT_{report.client_name}.docx"'
        return response