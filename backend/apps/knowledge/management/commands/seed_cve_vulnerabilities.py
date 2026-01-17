from django.core.management.base import BaseCommand
from apps.knowledge.models import VulnerabilityDefinition

class Command(BaseCommand):
    help = "Seed CVE-only vulnerability definitions"

    def handle(self, *args, **kwargs):
        cves = [
            {
                "title": "CVE-2024-12345",
                "cve_id": "CVE-2024-12345",
                "cvss_score": 9.8,
                "cvss_vector": "CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H",
                "severity": "CRITICAL",
                "description": "Remote SQL injection in XYZ product",
                "impact": "Remote code execution",
                "remediation": "Upgrade to fixed version",
            }
        ]

        for cve in cves:
            VulnerabilityDefinition.objects.get_or_create(
                cve_id=cve["cve_id"],
                defaults={
                    "title": cve["title"],
                    "source_type": "CVE",
                    "cvss_score": cve["cvss_score"],
                    "cvss_vector": cve["cvss_vector"],
                    "severity": cve["severity"],
                    "description": cve["description"],
                    "impact": cve["impact"],
                    "remediation": cve["remediation"],
                },
            )

        self.stdout.write(self.style.SUCCESS("✅ CVE-only vulnerabilities seeded"))
