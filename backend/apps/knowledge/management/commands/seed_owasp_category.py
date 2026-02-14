from django.core.management.base import BaseCommand
from apps.knowledge.models import OWASPCategory


class Command(BaseCommand):
    help = "Seed OWASP 2025 Categories"

    def handle(self, *args, **kwargs):

        categories = [
            "A01:2025 - Broken Access Control",
            "A02:2025 - Security Misconfiguration",
            "A03:2025 - Software Supply Chain Failures",
            "A04:2025 - Cryptographic Failures",
            "A05:2025 - Injection",
            "A06:2025 - Insecure Design",
            "A07:2025 - Authentication Failures",
            "A08:2025 - Software and Data Integrity Failures",
            "A09:2025 - Security Logging and Alerting Failures",
            "A10:2025 - Mishandling of Exceptional Conditions",
        ]

        for name in categories:
            OWASPCategory.objects.get_or_create(name=name)

        self.stdout.write(self.style.SUCCESS("OWASP 2025 categories seeded"))
