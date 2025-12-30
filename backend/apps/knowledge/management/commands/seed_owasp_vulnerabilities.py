from django.core.management.base import BaseCommand
from apps.knowledge.models import OWASPCategory, OWASPVulnerability

class Command(BaseCommand):
    help = "Seed OWASP vulnerabilities"

    def handle(self, *args, **kwargs):
        data = {
            "Injection": [
                {
                    "name": "SQL Injection",
                    "description": "Improper input validation leads to SQL Injection",
                    "severity": "Critical",
                    "impact": "Database compromise",
                    "remediation": "Use parameterized queries",
                },
                {
                    "name": "Cross-Site Scripting (XSS)",
                    "description": "Untrusted input executed in browser",
                    "severity": "High",
                    "impact": "Session hijacking",
                    "remediation": "Escape output and validate input",
                },
            ]
        }

        for category_name, vulns in data.items():
            category, _ = OWASPCategory.objects.get_or_create(name=category_name)

            for v in vulns:
                OWASPVulnerability.objects.get_or_create(
                    category=category,
                    name=v["name"],
                    defaults={
                        "description": v["description"],
                        "default_severity": v["severity"],
                        "default_impact": v["impact"],
                        "default_remediation": v["remediation"],
                    },
                )

        self.stdout.write(self.style.SUCCESS("✅ OWASP vulnerabilities seeded"))
