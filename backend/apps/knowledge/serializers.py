from rest_framework import serializers
from .models import (
    OWASPCategory,
    OWASPVulnerability,
    VulnerabilityVariant,
    VulnerabilityDefinition,
    Report,
    ReportFinding,
    FindingEvidence,
)

# -------------------------
# OWASP / Vulnerability
# -------------------------

class OWASPVulnerabilitySerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.name")

    class Meta:
        model = OWASPVulnerability
        fields = "__all__"


class OWASPCategorySerializer(serializers.ModelSerializer):
    vulnerabilities = OWASPVulnerabilitySerializer(many=True, read_only=True)

    class Meta:
        model = OWASPCategory
        fields = ["id", "name", "description", "vulnerabilities"]


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

    VALID_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

    def validate(self, data):
        source_type = data.get("source_type")
        owasp_vuln = data.get("owasp_vulnerability")
        variant = data.get("variant")

        if variant and not owasp_vuln:
            raise serializers.ValidationError(
                "Variant cannot be set without OWASP Vulnerability"
            )

        if variant and variant.owasp_vulnerability != owasp_vuln:
            raise serializers.ValidationError(
                "Variant does not belong to the selected OWASP Vulnerability"
            )

        if source_type == "CVE" and not data.get("cve_id"):
            raise serializers.ValidationError(
                "CVE source requires cve_id"
            )

        return data

    def validate_severity(self, value):
        if value not in self.VALID_SEVERITIES:
            raise serializers.ValidationError(
                "Severity must be one of: CRITICAL, HIGH, MEDIUM, LOW"
            )
        return value


# -------------------------
# REPORT
# -------------------------

class ReportSerializer(serializers.ModelSerializer):
    findings_count = serializers.SerializerMethodField()
    severity_counts = serializers.SerializerMethodField()

    class Meta:
        model = Report
        fields = [
            "id",
            "client_name",
            "application_name",
            "report_type",
            "target",
            "start_date",
            "end_date",
            "prepared_by",
            "findings_count",
            "severity_counts",
            "status", # Added status field
            "created_at",
        ]
        read_only_fields = ["id", "created_by", "created_at"]

    def validate(self, data):
        start = data.get("start_date")
        end = data.get("end_date")

        if start and end and start > end:
            raise serializers.ValidationError(
                "Start date cannot be after end date."
            )
        return data

    def get_findings_count(self, obj):
        return obj.findings.count()

    def get_severity_counts(self, obj):
        counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        # Efficiently iterate without N+1 (prefetched in view)
        for finding in obj.findings.all():
            sev = finding.final_severity
            if sev in counts:
                counts[sev] += 1
            elif sev: # Handle case-sensitivity or other values if needed
                capitalized = sev.capitalize()
                if capitalized in counts:
                    counts[capitalized] += 1
        return counts


# -------------------------
# EVIDENCE
# -------------------------

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


# -------------------------
# REPORT FINDINGS (THE IMPORTANT ONE)
# -------------------------

class ReportFindingSerializer(serializers.ModelSerializer):
    # Final computed fields
    final_title = serializers.ReadOnlyField()
    final_severity = serializers.ReadOnlyField()
    final_description = serializers.ReadOnlyField()
    final_impact = serializers.ReadOnlyField()
    final_remediation = serializers.ReadOnlyField()

    # Nested evidences (needed for API + PDF)
    evidences = FindingEvidenceSerializer(many=True, read_only=True)

    VALID_SEVERITIES = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]

    class Meta:
        model = ReportFinding
        fields = [
            "id",
            "report",
            "vulnerability",

            # Tester‑editable
            "tester_title",
            "tester_severity",
            "tester_description",
            "tester_impact",
            "tester_remediation",

            # Final computed
            "final_title",
            "final_severity",
            "final_description",
            "final_impact",
            "final_remediation",

            # Evidence
            "evidences",

            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "final_title",
            "final_severity",
            "final_description",
            "final_impact",
            "final_remediation",
        ]

    def validate_tester_severity(self, value):
        if value and value not in self.VALID_SEVERITIES:
            raise serializers.ValidationError(
                "tester_severity must be CRITICAL, HIGH, MEDIUM, or LOW"
            )
        return value
