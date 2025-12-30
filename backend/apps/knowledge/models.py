from django.db import models
from django.contrib.auth.models import User


# 1️⃣ OWASP Category
class OWASPCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# 2️⃣ OWASP Vulnerability
class OWASPVulnerability(models.Model):
    category = models.ForeignKey(
        OWASPCategory,
        on_delete=models.CASCADE,
        related_name="vulnerabilities"
    )

    name = models.CharField(max_length=150)
    description = models.TextField()

    default_severity = models.CharField(max_length=20)
    default_impact = models.TextField()
    default_remediation = models.TextField()

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name


# 3️⃣ Vulnerability Variant (optional)
class VulnerabilityVariant(models.Model):
    owasp_vulnerability = models.ForeignKey(
        OWASPVulnerability,
        on_delete=models.CASCADE,
        related_name="variants"
    )

    name = models.CharField(max_length=150)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


# 4️⃣ Vulnerability Definition (CORE TABLE)
class VulnerabilityDefinition(models.Model):

    SOURCE_CHOICES = [
        ("OWASP", "OWASP"),
        ("CVE", "CVE"),
        ("CUSTOM", "Custom"),
    ]

    title = models.CharField(max_length=200)
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)

    # Optional OWASP linkage
    owasp_category = models.ForeignKey(
        OWASPCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    owasp_vulnerability = models.ForeignKey(
        OWASPVulnerability,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    variant = models.ForeignKey(
        VulnerabilityVariant,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    # CVE info (optional)
    cve_id = models.CharField(max_length=50, null=True, blank=True)
    cvss_score = models.FloatField(null=True, blank=True)
    cvss_vector = models.CharField(max_length=200, null=True, blank=True)

    severity = models.CharField(max_length=20)
    description = models.TextField()
    impact = models.TextField()
    remediation = models.TextField()
    references = models.TextField(blank=True)

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title
