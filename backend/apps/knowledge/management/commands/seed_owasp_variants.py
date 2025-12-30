from django.core.management.base import BaseCommand
from apps.knowledge.models import OWASPVulnerability, VulnerabilityVariant

class Command(BaseCommand):
    help = "Seed OWASP vulnerability variants"

    def handle(self, *args, **kwargs):
        variants = {
            "SQL Injection": [
                "Blind SQL Injection",
                "Time-based SQL Injection",
                "Error-based SQL Injection",
            ],
            "Cross-Site Scripting (XSS)": [
                "Stored XSS",
                "Reflected XSS",
                "DOM-based XSS",
            ],
        }

        for vuln_name, variant_list in variants.items():
            try:
                vuln = OWASPVulnerability.objects.get(name=vuln_name)
            except OWASPVulnerability.DoesNotExist:
                self.stdout.write(self.style.ERROR(f"Missing OWASP vuln: {vuln_name}"))
                continue

            for name in variant_list:
                VulnerabilityVariant.objects.get_or_create(
                    owasp_vulnerability=vuln,
                    name=name
                )

        self.stdout.write(self.style.SUCCESS("✅ OWASP variants seeded"))
