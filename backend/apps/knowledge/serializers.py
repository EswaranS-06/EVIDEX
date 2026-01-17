from rest_framework import serializers
from apps.knowledge.models import Report
from .models import FindingEvidence
from .models import ReportFinding


from .models import (
    OWASPCategory,
    OWASPVulnerability,
    VulnerabilityVariant,
    VulnerabilityDefinition,
    Report,
    ReportFinding,
)

class OWASPCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = OWASPCategory
        fields = "__all__"
class OWASPVulnerabilitySerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.name")

    class Meta:
        model = OWASPVulnerability
        fields = "__all__"
class VulnerabilityVariantSerializer(serializers.ModelSerializer):
    owasp_vulnerability_name = serializers.ReadOnlyField(
        source="owasp_vulnerability.name"
    )

    class Meta:
        model = VulnerabilityVariant
        fields = "__all__"
class VulnerabilityDefinitionSerializer(serializers.ModelSerializer):

    class Meta:
        model = VulnerabilityDefinition
        fields = "__all__"

    def validate(self, data):
        source_type = data.get("source_type")
        owasp_vuln = data.get("owasp_vulnerability")
        variant = data.get("variant")

        # Rule 1: Variant requires OWASP vulnerability
        if variant and not owasp_vuln:
            raise serializers.ValidationError(
                "Variant cannot be set without OWASP Vulnerability"
            )

        # Rule 2: Variant must belong to OWASP vulnerability
        if variant and variant.owasp_vulnerability != owasp_vuln:
            raise serializers.ValidationError(
                "Variant does not belong to the selected OWASP Vulnerability"
            )

        # Rule 3: CVE-only validation
        if source_type == "CVE" and not data.get("cve_id"):
            raise serializers.ValidationError(
                "CVE source requires cve_id"
            )

        return data
    VALID_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

    def validate_severity(self, value):
        if value not in VALID_SEVERITIES:
            raise serializers.ValidationError(
                "Severity must be one of: CRITICAL, HIGH, MEDIUM, LOW"
            )
        return value
class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = [
            "id",
            "client_name",
            "application_name",
            "report_type",
            "start_date",
            "end_date",
            "prepared_by",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
        
    def validate(self, data):
        start = data.get("start_date")
        end = data.get("end_date")

        if start and end and start > end:
            raise serializers.ValidationError(
                "Start date cannot be after end date."
            )

        return data


class ReportFindingSerializer(serializers.ModelSerializer):
    # -----------------------
    # FINAL (READ-ONLY)
    # -----------------------
    final_description = serializers.ReadOnlyField()
    final_impact = serializers.ReadOnlyField()
    final_remediation = serializers.ReadOnlyField()

    class Meta:
        model = ReportFinding
        fields = [
            "id",
            "report",
            "vulnerability",
           

            # -----------------------
            # TESTER-EDITABLE FIELDS
            # -----------------------
            "tester_title",
            "tester_severity",
            "tester_description",
            "tester_impact",
            "tester_remediation",
            

            # -----------------------
            # COMPUTED FINAL OUTPUT
            # -----------------------
            "final_title",
            "final_severity",
            "final_description",
            "final_impact",
            "final_remediation",

            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "final_description",
            "final_impact",
            "final_remediation",
        ]


class FindingEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = FindingEvidence
        fields = [
            "id",
            "finding",
            "title",
            "file",
            "description",
            "created_at",
        ]
        read_only_fields = ["id", "created_at", "finding"]
