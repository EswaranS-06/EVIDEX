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
            finding = serializer.save(report=report)
            # Refresh finding with proper relationships for response
            finding = (
                ReportFinding.objects
                .filter(id=finding.id)
                .select_related("vulnerability")
                .prefetch_related("evidences")
                .first()
            )
            response_serializer = ReportFindingSerializer(finding)
            return Response(response_serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BulkReportFindingsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, report_id):
        """
        Bulk create findings for a report.
        
        Expected payload: list of finding objects
        [
            {"vulnerability": 1, "tester_title": "...", ...},
            {"vulnerability": 2, "tester_description": "...", ...},
            ...
        ]
        """
        report = get_object_or_404(Report, id=report_id)

        # Validate that data is a list
        if not isinstance(request.data, list):
            return Response(
                {"error": "Expected a list of findings"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(request.data) == 0:
            return Response(
                {"error": "At least one finding is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        created_findings = []
        errors = []

        for idx, finding_data in enumerate(request.data):
            serializer = ReportFindingSerializer(data=finding_data)
            
            if serializer.is_valid():
                finding = serializer.save(report=report)
                # Refresh with proper relationships
                finding = (
                    ReportFinding.objects
                    .filter(id=finding.id)
                    .select_related("vulnerability")
                    .prefetch_related("evidences")
                    .first()
                )
                response_serializer = ReportFindingSerializer(finding)
                created_findings.append(response_serializer.data)
            else:
                errors.append({
                    "index": idx,
                    "data": finding_data,
                    "errors": serializer.errors
                })

        # If all failed, return error
        if not created_findings:
            return Response(
                {"errors": errors},
                status=status.HTTP_400_BAD_REQUEST
            )

        # If some succeeded and some failed, return partial success
        if errors:
            return Response(
                {
                    "created": created_findings,
                    "errors": errors,
                    "message": f"Created {len(created_findings)} findings with {len(errors)} errors"
                },
                status=status.HTTP_207_MULTI_STATUS  # Partial success
            )

        # All succeeded
        return Response(
            {
                "created": created_findings,
                "message": f"Successfully created {len(created_findings)} findings"
            },
            status=status.HTTP_201_CREATED
        )


class ReportFindingDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_finding(self, pk, report_id=None):
        """Get finding with proper relationships loaded"""
        if report_id:
            finding = (
                ReportFinding.objects
                .filter(id=pk, report_id=report_id)
                .select_related("vulnerability")
                .prefetch_related("evidences")
                .first()
            )
            if not finding:
                raise get_object_or_404(ReportFinding, id=pk, report_id=report_id)
        else:
            finding = (
                ReportFinding.objects
                .filter(id=pk)
                .select_related("vulnerability")
                .prefetch_related("evidences")
                .first()
            )
            if not finding:
                raise get_object_or_404(ReportFinding, id=pk)
        return finding

    def get(self, request, pk, report_id=None):
        finding = self._get_finding(pk, report_id)
        serializer = ReportFindingSerializer(finding)
        return Response(serializer.data)

    def patch(self, request, pk, report_id=None):
        finding = self._get_finding(pk, report_id)

        serializer = ReportFindingSerializer(
            finding,
            data=request.data,
            partial=True,
        )

        if serializer.is_valid():
            serializer.save()
            # Refresh to get updated relationships
            finding = self._get_finding(pk, report_id)
            response_serializer = ReportFindingSerializer(finding)
            return Response(response_serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, report_id=None):
        finding = self._get_finding(pk, report_id)
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
