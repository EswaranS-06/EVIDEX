import json
import os

from django.core.management.base import BaseCommand
from django.conf import settings

from apps.knowledge.models import (
    OWASPCategory,
    OWASPVulnerability,
    VulnerabilityVariant,
    VulnerabilityDefinition,
)


def normalize_text(value):
    """
    Normalize text fields coming from JSON.
    - list  -> join with newline
    - str   -> return as-is
    - other -> empty string
    """
    if isinstance(value, list):
        return "\n".join(value)
    elif isinstance(value, str):
        return value
    return ""


class Command(BaseCommand):
    help = "Seed OWASP 2025 testcases into VulnerabilityDefinition"

    def handle(self, *args, **kwargs):

        json_path = os.path.join(
            settings.BASE_DIR,
            "apps",
            "knowledge",
            "data",
            "testcases",
            "testcases_owasp_2025.json",
        )

        self.stdout.write(f"DEBUG PATH: {json_path}")

        if not os.path.exists(json_path):
            self.stderr.write("❌ Testcases JSON file not found")
            return

        with open(json_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        testcases = data.get("testcases", [])

        created = 0
        skipped = 0

        for tc in testcases:
            title = tc.get("title")
            severity = tc.get("severity", "MEDIUM")

            category_name = tc.get("owasp_category")
            vuln_name = tc.get("owasp_vulnerability")
            variant_name = tc.get("variant")

            if not (title and category_name and vuln_name and variant_name):
                skipped += 1
                continue

            # -------------------------
            # Get Category
            # -------------------------
            try:
                category = OWASPCategory.objects.get(name=category_name)
            except OWASPCategory.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Category missing: {category_name}")
                )
                skipped += 1
                continue

            # -------------------------
            # Get Sub-Vulnerability
            # -------------------------
            try:
                vuln = OWASPVulnerability.objects.get(
                    name=vuln_name,
                    category=category
                )
            except OWASPVulnerability.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Sub vulnerability missing: {vuln_name}")
                )
                skipped += 1
                continue

            # -------------------------
            # Get Variant
            # -------------------------
            try:
                variant = VulnerabilityVariant.objects.get(
                    name=variant_name,
                    owasp_vulnerability=vuln
                )
            except VulnerabilityVariant.DoesNotExist:
                self.stdout.write(
                    self.style.WARNING(f"Variant missing: {variant_name}")
                )
                skipped += 1
                continue

            # -------------------------
            # Create / Get Testcase
            # -------------------------
            obj, is_created = VulnerabilityDefinition.objects.get_or_create(
                title=title,
                defaults={
                    "source_type": "OWASP",
                    "severity": severity,
                    "description": tc.get("description", ""),
                    "impact": normalize_text(tc.get("impact")),
                    "remediation": normalize_text(tc.get("remediation")),
                    "references": normalize_text(tc.get("references")),
                    "owasp_category": category,
                    "owasp_vulnerability": vuln,
                    "variant": variant,
                    "cvss_score": tc.get("cvss_score"),
                    "cvss_vector": tc.get("cvss_vector"),
                },
            )

            if is_created:
                created += 1
            else:
                skipped += 1

        # -------------------------
        # FINAL OUTPUT
        # -------------------------
        self.stdout.write(
            self.style.SUCCESS(
                f"✅ Testcases seeded successfully: {created}, skipped: {skipped}"
            )
        )
