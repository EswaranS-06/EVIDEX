from django.http import HttpResponse, Http404
from apps.knowledge.models import Report
from .reports.docx_builder.build_docx import build_docx
import tempfile
import io

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes
from apps.knowledge.permissions.export_permissions import CanExportReport
from apps.knowledge.throttles import ReportExportThrottle
from django.shortcuts import get_object_or_404
from apps.knowledge.utils.watermark import get_watermark_data

class ReportDOCXView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated, CanExportReport]
    throttle_classes = [ReportExportThrottle]

    @extend_schema(
        operation_id="download_report_docx",
        summary="Export Report as DOCX",
        description="Generates and exports the security assessment report as a DOCX file, optionally encrypted with a password.",
        tags=["Reports"],
        request=OpenApiTypes.OBJECT,
        responses={200: OpenApiTypes.BINARY},
    )
    def post(self, request, report_id):

        report = get_object_or_404(Report, id=report_id)
        self.check_object_permissions(request, report)

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
            "watermark_data": get_watermark_data(request)
            }
        
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")

        build_docx(tmp.name, data, report.id)

        password = request.data.get("password", "").strip()

        if password:
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