from rest_framework import serializers
from .models import (
    OWASPCategory,
    OWASPVulnerability,
    VulnerabilityVariant,
    VulnerabilityDefinition,
    Report,
    ReportFinding,
    FindingEvidence,
    Notification,
)
from drf_spectacular.utils import extend_schema_field
from drf_spectacular.types import OpenApiTypes

# -------------------------
# OWASP / Vulnerability
# -------------------------

class OWASPVulnerabilitySerializer(serializers.ModelSerializer):
    category_name = serializers.ReadOnlyField(source="category.name")
    variants = serializers.StringRelatedField(many=True, read_only=True)

    class Meta:
        model = OWASPVulnerability
        fields = ["id", "category", "category_name", "name", "description", "default_severity", "default_impact", "default_remediation", "variants", "created_at", "updated_at"]


class VulnerabilityDefinitionSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="title", required=False)
    default_severity = serializers.ReadOnlyField(source="severity")
    default_impact = serializers.ReadOnlyField(source="impact")
    default_remediation = serializers.ReadOnlyField(source="remediation")

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


class OWASPCategorySerializer(serializers.ModelSerializer):
    vulnerabilities = VulnerabilityDefinitionSerializer(source="vulnerabilitydefinition_set", many=True, read_only=True)

    class Meta:
        model = OWASPCategory
        fields = ["id", "name", "description", "vulnerabilities"]


# VulnerabilityVariant moved down to keep it near its usage if needed or just alphabetical
class VulnerabilityVariantSerializer(serializers.ModelSerializer):
    owasp_vulnerability_name = serializers.ReadOnlyField(
        source="owasp_vulnerability.name"
    )

    class Meta:
        model = VulnerabilityVariant
        fields = "__all__"


# -------------------------
# REPORT
# -------------------------

class ReportSerializer(serializers.ModelSerializer):
    findings_count = serializers.SerializerMethodField()
    severity_counts = serializers.SerializerMethodField()
    updated_by_name = serializers.ReadOnlyField(source="updated_by.username")

    class Meta:
        model = Report
        fields = [
            "id",
            "client_name",
            "application_name",
            "report_type",
            "target",
            "tools_used",
            "test_location",
            "start_date",
            "end_date",
            "prepared_by",
            "reviewed_by",
            "approved_by",
            "findings_count",
            "severity_counts",
            "status", # Added status field
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
            "updated_by_name"
        ]
        read_only_fields = ["id", "created_by", "created_at", "updated_at", "updated_by_name"]

    def validate(self, data):
        start = data.get("start_date")
        end = data.get("end_date")

        if start and end and start > end:
            raise serializers.ValidationError(
                "Start date cannot be after end date."
            )

        target = data.get("target")
        if target:
            urls = [line for line in target.split("\n") if line.strip()]
            if len(urls) > 50:
                raise serializers.ValidationError({"target": "Cannot add more than 50 URLs."})

        tools_used = data.get("tools_used")
        if tools_used:
            tools = [line for line in tools_used.split("\n") if line.strip()]
            if len(tools) > 50:
                raise serializers.ValidationError({"tools_used": "Cannot add more than 50 Tools."})

        return data

    @extend_schema_field(OpenApiTypes.INT)
    def get_findings_count(self, obj):
        return obj.findings.count()

    @extend_schema_field(OpenApiTypes.OBJECT)
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
    updated_by_name = serializers.ReadOnlyField(source="updated_by.username")

    class Meta:
        model = FindingEvidence
        fields = [
            "id",
            "finding",
            "title",
            "file",
            "description",
            "created_at",
            "updated_at",
            "updated_by",
            "updated_by_name",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "updated_by_name", "finding"]

    def validate_file(self, value):
        from rest_framework.exceptions import ValidationError
        import os
        import uuid
        from PIL import Image

        # 1. Size Validation (Max 2MB)
        max_size = 2 * 1024 * 1024 # 2MB
        if value.size > max_size:
            raise ValidationError("File size must be less than or equal to 2MB")

        # 2. Extension Validation
        ext = os.path.splitext(value.name)[1].lower()
        if ext not in ['.png', '.jpg', '.jpeg']:
            raise ValidationError("Only PNG, JPG, JPEG formats are allowed")

        # 3. Content Validation (MIME / Image check)
        if value.content_type not in ['image/png', 'image/jpeg']:
            raise ValidationError("Only PNG, JPG, JPEG formats are allowed")

        # Validate that it is actually a valid image using PIL
        try:
            img = Image.open(value)
            img.verify() # verifies it's a valid image without decoding the whole thing
            value.seek(0) # reset file pointer
        except Exception:
            raise ValidationError("Only PNG, JPG, JPEG formats are allowed")

        # Normalize filename
        value.name = f"{uuid.uuid4().hex}{ext}"

        return value

    def validate_file(self, value):
        if value:
            # Check file size (2MB max)
            if value.size > 2 * 1024 * 1024:
                raise serializers.ValidationError("Image file size must be under 2MB.")

            # Check file extension
            import os
            ext = os.path.splitext(value.name)[1].lower()
            valid_extensions = ['.jpg', '.jpeg', '.png']
            if ext not in valid_extensions:
                raise serializers.ValidationError("Only PNG, JPG, and JPEG files are allowed.")
            
            # Check content_type
            if hasattr(value, 'content_type'):
                valid_content_types = ['image/jpeg', 'image/png']
                if value.content_type not in valid_content_types:
                    raise serializers.ValidationError("Only PNG, JPG, and JPEG files are allowed.")

        return value


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
    vulnerability_name = serializers.ReadOnlyField(source="vulnerability.title")
    category_name = serializers.ReadOnlyField(source="vulnerability.owasp_category.name")
    source_type = serializers.ReadOnlyField(source="vulnerability.source_type")
    updated_by_name = serializers.ReadOnlyField(source="updated_by.username")

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
            "vulnerability_name",
            "category_name",
            "source_type",

            # Evidence
            "evidences",

            "status",
            "created_at",
            "updated_at",
            "updated_by",
            "updated_by_name",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
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

# -------------------------
# NOTIFICATIONS
# -------------------------

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "user", "title", "message", "type", "is_read", "link", "created_at", "updated_at"]
        read_only_fields = ["id", "user", "created_at", "updated_at"]
