from django.core.management.base import BaseCommand
from apps.knowledge.models import OWASPCategory, OWASPVulnerability


SUB_VULNS = {
    "A01:2025 - Broken Access Control": [
        "Broken Access Control",
        "Insecure Direct Object Reference (IDOR)",
        "Missing Function-Level Access Control",
        "Privilege Escalation",
    ],
    "A02:2025 - Security Misconfiguration": [
        "Missing Security Headers",
        "Improper CORS Configuration",
        "Default Credentials",
        "Debug Mode Enabled",
        "Unnecessary Services Enabled",
    ],
    "A03:2025 - Software Supply Chain Failures": [
        "Vulnerable Third-Party Libraries",
        "Dependency Confusion",
        "Unverified Package Sources",
        "Outdated Dependencies",
    ],
    "A04:2025 - Cryptographic Failures": [
        "Weak Encryption Algorithms",
        "Hardcoded Cryptographic Keys",
        "Insecure Key Management",
        "Missing Encryption of Sensitive Data",
    ],
    "A05:2025 - Injection": [
        "SQL Injection",
        "Cross-Site Scripting (XSS)",
        "Command Injection",
        "LDAP Injection",
        "NoSQL Injection",
    ],
    "A06:2025 - Insecure Design": [
        "Missing Threat Modeling",
        "Business Logic Flaws",
        "Insecure Workflow Design",
        "Lack of Rate Limiting",
    ],
    "A07:2025 - Authentication Failures": [
        "Weak Password Policy",
        "Credential Stuffing",
        "Brute Force Attacks",
        "Improper Session Management",
        "Missing MFA",
    ],
    "A08:2025 - Software and Data Integrity Failures": [
        "Insecure Deserialization",
        "Untrusted Updates",
        "Integrity Check Bypass",
        "Unsigned Code Execution",
    ],
    "A09:2025 - Security Logging and Alerting Failures": [
        "Insufficient Logging",
        "Log Injection",
        "Missing Alerting",
        "No Incident Response Triggers",
    ],
    "A10:2025 - Mishandling of Exceptional Conditions": [
        "Stack Trace Disclosure",
        "Improper Error Handling",
        "Application Crash on Invalid Input",
        "Unhandled Exceptions",
    ],
}


class Command(BaseCommand):
    help = "Seed OWASP Sub-Vulnerabilities"

    def handle(self, *args, **kwargs):

        for category_name, vulns in SUB_VULNS.items():
            category = OWASPCategory.objects.get(name=category_name)

            for vuln in vulns:
                OWASPVulnerability.objects.get_or_create(
                    category=category,
                    name=vuln
                )

        self.stdout.write(self.style.SUCCESS("OWASP sub-vulnerabilities seeded"))
