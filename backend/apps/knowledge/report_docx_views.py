from django.http import HttpResponse, Http404
from apps.knowledge.models import Report
from .reports.docx_builder.build_docx import build_docx
import tempfile

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes


class ReportDOCXView(APIView):

    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="download_report_docx",
        summary="Export Report as DOCX",
        description="Generates and exports the security assessment report as a DOCX file.",
        tags=["Reports"],
        responses={200: OpenApiTypes.BINARY},
    )
    def get(self, request, report_id):

        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            raise Http404("Report not found")

        data = {
            "enterprise": report.client_name,
            "application_name": report.application_name,
            "start_date": report.start_date.strftime("%d-%b-%Y") if report.start_date else "",
            "end_date": report.end_date.strftime("%d-%b-%Y") if report.end_date else "",
        }

        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")

        build_docx(tmp.name, data, report.id)

        with open(tmp.name, "rb") as f:
            response = HttpResponse(
                f.read(),
                content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            )
            response["Content-Disposition"] = f'attachment; filename="VAPT_{report.client_name}.docx"'
            return response