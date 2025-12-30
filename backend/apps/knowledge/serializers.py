from rest_framework import serializers
from .models import (
    OWASPCategory,
    OWASPVulnerability,
    VulnerabilityVariant,
    VulnerabilityDefinition,
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
