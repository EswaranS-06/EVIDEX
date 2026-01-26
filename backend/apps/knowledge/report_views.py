from django.http import HttpResponse
from django.template.loader import render_to_string
from django.shortcuts import get_object_or_404

from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

from apps.knowledge.models import (
    Report,
    ReportFinding,
    FindingEvidence,
)

from apps.knowledge.serializers import (
    ReportSerializer,
    ReportFindingSerializer,
    FindingEvidenceSerializer,
)

# -------------------------
# TEST PDF VIEW (unchanged)
# -------------------------
def test_pdf(request):
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


# -------------------------
# REPORT CRUD
# -------------------------
class ReportViewSet(ModelViewSet):
    queryset = Report.objects.all().order_by("-created_at").prefetch_related("findings__vulnerability")
    serializer_class = ReportSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


# -------------------------
# REPORT FINDINGS
# -------------------------
class ReportFindingListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, report_id):
        report = get_object_or_404(Report, id=report_id)

        findings = (
            ReportFinding.objects
            .filter(report=report)
            .select_related("vulnerability")  # ✅ important for final_* logic
            .prefetch_related("evidences")
        )

        serializer = ReportFindingSerializer(findings, many=True)
        return Response(serializer.data)

    def post(self, request, report_id):
        report = get_object_or_404(Report, id=report_id)

        serializer = ReportFindingSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(report=report)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReportFindingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        finding = get_object_or_404(ReportFinding, id=pk)

        serializer = ReportFindingSerializer(
            finding,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        finding = get_object_or_404(ReportFinding, id=pk)
        finding.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# -------------------------
# EVIDENCE APIs
# -------------------------
class EvidenceListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, finding_id):
        evidences = FindingEvidence.objects.filter(finding_id=finding_id)
        serializer = FindingEvidenceSerializer(evidences, many=True)
        return Response(serializer.data)

    def post(self, request, finding_id):
        serializer = FindingEvidenceSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(finding_id=finding_id)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EvidenceDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        evidence = get_object_or_404(FindingEvidence, id=pk)
        evidence.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
