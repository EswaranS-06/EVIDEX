from django.http import HttpResponse, Http404, JsonResponse
from django.core.mail import EmailMessage
from apps.knowledge.models import Report
from .pdf_reportlab.build import build_report
from .docx_builder.build_docx import build_docx
import tempfile
import io

from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes
from apps.knowledge.models import Notification


class ReportPDFView(APIView):
    # authentication_classes = [JWTAuthentication]     <------- Enable JWT auth later
    # permission_classes = [IsAuthenticated]    <------- Enable JWT auth later
    # Temporarily disable JWT authentication (allow anonymous access)
    authentication_classes = []
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="download_report_pdf",
        summary="Export Report as PDF",
        description="Generates and exports a complete security assessment report as a PDF file. Accepts optional password in request body.",
        tags=["Reports"],
        request=OpenApiTypes.OBJECT,
        responses={
            200: OpenApiTypes.BINARY,
            401: {"description": "Unauthorized - No valid JWT token"},
            404: {"description": "Report not found"},
        },
    )
    def post(self, request, report_id):
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            raise Http404("Report not found")

        # Extract password from POST payload
        password = request.data.get("password", "").strip()

        data = {
            "enterprise": report.application_name,
            "pt_date": report.created_at.strftime("%b %Y") if report.created_at else "N/A",
            "conducted_by": str(report.created_by) if report.created_by else "Cyber Team",
            "version": "1.0",
            "assessee": report.client_name,
            "assessor": str(report.created_by) if report.created_by else "John",
            "reviewed_by": report.reviewed_by or "Jane",
            "approved_by": report.approved_by or "CTO",
            "total_pages": 8,
            "start_date": report.start_date.strftime("%d-%b-%Y") if report.start_date else "",
            "end_date": report.end_date.strftime("%d-%b-%Y") if report.end_date else "",
            "application_name": report.application_name,
            "created_by": str(report.created_by) if report.created_by else "",
            "target": report.target or "",
            "tools_used": report.tools_used or "",
            "test_location": report.test_location or "",
        }

        # Step A: Generate raw PDF to a temp file
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
        build_report(tmp.name, data, report.id)

        # Step B & C: Check password and encrypt if necessary
        if password:
            from PyPDF2 import PdfReader, PdfWriter
            
            # Read the raw PDF
            reader = PdfReader(tmp.name)
            writer = PdfWriter()
            
            # Copy all pages
            for page in reader.pages:
                writer.add_page(page)
                
            # Encrypt with password
            writer.encrypt(password)
            
            # Output to memory
            output_buffer = io.BytesIO()
            writer.write(output_buffer)
            pdf_bytes = output_buffer.getvalue()
        else:
            # If no password, just read the raw file
            with open(tmp.name, "rb") as f:
                pdf_bytes = f.read()

        # Step D: Return response
        response = HttpResponse(pdf_bytes, content_type="application/pdf")
        response["Content-Disposition"] = f'attachment; filename="VAPT_{report.client_name}.pdf"'
        response["Cache-Control"] = "no-store, no-cache, must-revalidate, max-age=0"
        response["Pragma"] = "no-cache"
        response["Expires"] = "0"
        return response

class SendReportEmailView(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [AllowAny]

    @extend_schema(
        operation_id="send_report_email",
        summary="Email Report as PDF",
        description="Generates, optionally encrypts, and emails the report as a PDF attachment.",
        tags=["Reports"],
        request=OpenApiTypes.OBJECT,
        responses={
            200: {"description": "Email sent successfully"},
            400: {"description": "Bad Request"},
            404: {"description": "Report not found"},
            500: {"description": "Server Error"},
        },
    )
    def post(self, request):
        report_id = request.data.get("report_id")
        if not report_id:
            return JsonResponse({"status": "error", "message": "report_id is required"}, status=400)
            
        try:
            report = Report.objects.get(id=report_id)
        except Report.DoesNotExist:
            return JsonResponse({"status": "error", "message": "Report not found"}, status=404)

        email = request.data.get("email", "").strip()
        if not email and request.user.is_authenticated:
            email = request.user.email
        
        if not email:
            return JsonResponse({"status": "error", "message": "Email address is required"}, status=400)
            
        password = request.data.get("password", "").strip()
        subject = request.data.get("subject", "").strip() or "Security Assessment Report"
        body = request.data.get("body", "").strip() or "Hi,\n\nPlease find attached the security assessment report.\n\nRegards,\nEVIDEX Team"

        data = {
            "enterprise": report.application_name,
            "pt_date": report.created_at.strftime("%b %Y") if report.created_at else "N/A",
            "conducted_by": str(report.created_by) if report.created_by else "Cyber Team",
            "version": "1.0",
            "assessee": report.client_name,
            "assessor": str(report.created_by) if report.created_by else "John",
            "reviewed_by": report.reviewed_by or "Jane",
            "approved_by": report.approved_by or "CTO",
            "total_pages": 8,
            "start_date": report.start_date.strftime("%d-%b-%Y") if report.start_date else "",
            "end_date": report.end_date.strftime("%d-%b-%Y") if report.end_date else "",
            "application_name": report.application_name,
            "created_by": str(report.created_by) if report.created_by else "",
            "target": report.target or "",
            "tools_used": report.tools_used or "",
            "test_location": report.test_location or "",
        }

        attach_pdf = request.data.get("attach_pdf", True)
        attach_docx = request.data.get("attach_docx", False)

        cc = request.data.get("cc", "").strip()
        cc_list = [c.strip() for c in cc.split(",") if c.strip()] if cc else []

        # Step D: Send Email
        try:
            email_msg = EmailMessage(
                subject=subject,
                body=body,
                to=[email],
                cc=cc_list,
            )

            # --- PDF Attachment ---
            if attach_pdf:
                # Step A: Generate raw PDF to a temp file
                tmp_pdf = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
                build_report(tmp_pdf.name, data, report.id)

                if password:
                    from PyPDF2 import PdfReader, PdfWriter
                    reader = PdfReader(tmp_pdf.name)
                    writer = PdfWriter()
                    for page in reader.pages:
                        writer.add_page(page)
                    writer.encrypt(password)
                    output_buffer = io.BytesIO()
                    writer.write(output_buffer)
                    pdf_bytes = output_buffer.getvalue()
                else:
                    with open(tmp_pdf.name, "rb") as f:
                        pdf_bytes = f.read()
                
                email_msg.attach(f"VAPT_{report.client_name}.pdf", pdf_bytes, "application/pdf")

            # --- DOCX Attachment ---
            if attach_docx:
                tmp_docx = tempfile.NamedTemporaryFile(delete=False, suffix=".docx")
                # Unified DOCX data needs
                docx_data = data.copy()
                docx_data["enterprise"] = report.client_name # Ensure DOCX uses client_name for enterprise field
                build_docx(tmp_docx.name, docx_data, report.id)

                if password:
                    from msoffcrypto.format.ooxml import OOXMLFile
                    
                    with open(tmp_docx.name, "rb") as f:
                        ooxml_file = OOXMLFile(f)
                        encrypted_io = io.BytesIO()
                        ooxml_file.encrypt(password, encrypted_io)
                        docx_bytes = encrypted_io.getvalue()
                else:
                    with open(tmp_docx.name, "rb") as f:
                        docx_bytes = f.read()

                email_msg.attach(f"VAPT_{report.client_name}.docx", docx_bytes, "application/vnd.openxmlformats-officedocument.wordprocessingml.document")

            if not attach_pdf and not attach_docx:
                return JsonResponse({"status": "error", "message": "At least one attachment (PDF or DOCX) must be selected."}, status=400)

            email_msg.send(fail_silently=False)
            
            # Create success notification
            if request.user.is_authenticated:
                Notification.objects.create(
                    user=request.user,
                    title="Report Emailed",
                    message=f"Successfully sent report for {report.client_name} to {email}.",
                    type="success",
                    link=f"/report/{report.id}"
                )
            
            return JsonResponse({"status": "success", "message": "Email sent successfully"}, status=200)
        except Exception as e:
            # Create error notification
            if request.user.is_authenticated:
                Notification.objects.create(
                    user=request.user,
                    title="Email Failed",
                    message=f"Could not send report for {report.client_name} to {email}.",
                    type="error",
                    link=f"/report/{report.id}"
                )
                
            return JsonResponse({"status": "error", "message": f"Failed to send email: {str(e)}"}, status=500)
