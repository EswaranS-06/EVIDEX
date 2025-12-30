from django.core.management.base import BaseCommand
from apps.knowledge.models import OWASPVulnerability, VulnerabilityDefinition

class Command(BaseCommand):
    help = "Seed OWASP + CVE linked vulnerabilities"

    def handle(self, *args, **kwargs):
        mappings = [
            {
                "title": "SQL Injection via CVE-2024-9999",
                "owasp_vuln": "SQL Injection",
                "cve_id": "CVE-2024-9999",
                "cvss_score": 9.1,
                "severity": "Critical",
                "description": "SQL injection vulnerability mapped to OWASP",
                "impact": "Database compromise",
                "remediation": "Patch and use prepared statements",
            }
        ]

        for item in mappings:
            try:
                owasp_vuln = OWASPVulnerability.objects.get(name=item["owasp_vuln"])
            except OWASPVulnerability.DoesNotExist:
                self.stdout.write(self.style.ERROR("OWASP vuln missing"))
                continue

            VulnerabilityDefinition.objects.get_or_create(
                title=item["title"],
                defaults={
                    "source_type": "OWASP",
                    "owasp_vulnerability": owasp_vuln,
                    "cve_id": item["cve_id"],
                    "cvss_score": item["cvss_score"],
                    "severity": item["severity"],
                    "description": item["description"],
                    "impact": item["impact"],
                    "remediation": item["remediation"],
                },
            )

        self.stdout.write(self.style.SUCCESS("✅ OWASP + CVE vulnerabilities seeded"))
