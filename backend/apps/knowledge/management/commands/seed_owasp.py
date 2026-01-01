from django.core.management.base import BaseCommand
from apps.knowledge.models import (
    OWASPCategory,
    OWASPVulnerability,
    VulnerabilityVariant,
)



class Command(BaseCommand):
    help = "Seed baseline OWASP categories and vulnerabilities"

    def handle(self, *args, **options):

        categories = {
            "Injection": "Injection flaws such as SQL, OS, and LDAP injection",
            "Broken Access Control": "Restrictions not properly enforced",
            "Security Misconfiguration": "Improper security configuration",
            "Cryptographic Failures": "Failures related to cryptography",
        }

        category_objs = {}

        # Seed categories
        for name, desc in categories.items():
            category, created = OWASPCategory.objects.get_or_create(
                name=name,
                defaults={"description": desc}
            )
            category_objs[name] = category

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created category: {name}"))
            else:
                self.stdout.write(self.style.WARNING(f"Category exists: {name}"))

        # Seed vulnerabilities
        vulnerabilities = [
            {
                "category": "Injection",
                "name": "SQL Injection",
                "description": "Improper input validation leads to SQL Injection",
                "severity": "CRITICAL",
                "impact": "Database compromise",
                "remediation": "Use parameterized queries",
            },
            {
                "category": "Injection",
                "name": "Cross-Site Scripting (XSS)",
                "description": "Untrusted input is executed in the browser",
                "severity": "High",
                "impact": "Session hijacking",
                "remediation": "Escape output and validate input",
            },
            {
                "category": "Broken Access Control",
                "name": "Insecure Direct Object Reference (IDOR)",
                "description": "Direct access to objects without authorization",
                "severity": "High",
                "impact": "Unauthorized data access",
                "remediation": "Enforce authorization checks",
            },
        ]

        for vuln in vulnerabilities:
            obj, created = OWASPVulnerability.objects.get_or_create(
                name=vuln["name"],
                category=category_objs[vuln["category"]],
                defaults={
                    "description": vuln["description"],
                    "default_severity": vuln["severity"],
                    "default_impact": vuln["impact"],
                    "default_remediation": vuln["remediation"],
                },
            )

            if created:
                self.stdout.write(self.style.SUCCESS(f"Created vulnerability: {vuln['name']}"))
            else:
                self.stdout.write(self.style.WARNING(f"Vulnerability exists: {vuln['name']}"))

        self.stdout.write(self.style.SUCCESS("✅ OWASP seeding completed"))


        # Seed variants (linked to OWASP vulnerabilities)
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
            "Insecure Direct Object Reference (IDOR)": [
                "Horizontal Privilege Escalation",
                "Vertical Privilege Escalation",
            ],
        }

        for vuln_name, variant_list in variants.items():
            try:
                owasp_vuln = OWASPVulnerability.objects.get(name=vuln_name)
            except OWASPVulnerability.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f"OWASP Vulnerability not found: {vuln_name}")
                )
                continue

            for variant_name in variant_list:
                variant, created = VulnerabilityVariant.objects.get_or_create(
                    owasp_vulnerability=owasp_vuln,
                    name=variant_name,
                )

                if created:
                    self.stdout.write(
                        self.style.SUCCESS(
                            f"Created variant: {variant_name} ({vuln_name})"
                        )
                    )
                else:
                    self.stdout.write(
                        self.style.WARNING(
                            f"Variant exists: {variant_name} ({vuln_name})"
                        )
                    )
