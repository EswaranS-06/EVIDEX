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

    SEVERITY_CHOICES = [
    ("CRITICAL", "Critical"),
    ("HIGH", "High"),
    ("MEDIUM", "Medium"),
    ("LOW", "Low"),
    ]

    severity = models.CharField(
        max_length=20,
        choices=SEVERITY_CHOICES
    )

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

# =========================
# REPORT & FINDINGS MODELS
# =========================


from django.db import models
from django.contrib.auth.models import User


class Report(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('in_progress', 'In Progress'),
        ('verified', 'Verified'),
        ('completed', 'Completed'),
    ]

    client_name = models.CharField(max_length=200)
    application_name = models.CharField(max_length=200)
    report_type = models.CharField(max_length=100)
    target = models.TextField()
    tools_used = models.TextField(blank=True, default="")
    test_location = models.CharField(max_length=50, default="Off-site") # On-site, Off-site

    start_date = models.DateField(null=True, blank=True)
    end_date = models.DateField(null=True, blank=True)

    prepared_by = models.CharField(max_length=150)
    reviewed_by = models.CharField(max_length=150, blank=True, default="")
    approved_by = models.CharField(max_length=150, blank=True, default="")

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft'
    )

    created_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="created_reports"
    )

    assigned_to = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="assigned_reports",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_reports"
    )

    def __str__(self):
        return f"{self.client_name} - {self.application_name}"



from apps.knowledge.models import VulnerabilityDefinition  

class ReportFinding(models.Model):
    report = models.ForeignKey(
        Report,
        on_delete=models.CASCADE,
        related_name="findings",
        null=True
    )

    vulnerability = models.ForeignKey(
        VulnerabilityDefinition,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="report_findings"
    )

    

    # -----------------------
    # OLD FIELDS (KEEP FOR NOW)
    # -----------------------
    title = models.CharField(max_length=200,blank=True)
    severity = models.CharField(max_length=20,blank=True)
    
    description = models.TextField(blank=True)
    impact = models.TextField(blank=True)
    remediation = models.TextField(blank=True)

    # -----------------------
    # ✅ NEW DUAL-LAYER FIELDS
    # -----------------------
    tester_title = models.CharField(max_length=200,blank=True)
    tester_severity = models.CharField(max_length=20,blank=True)
    
    tester_description = models.TextField(blank=True)
    tester_impact = models.TextField(blank=True)
    tester_remediation = models.TextField(blank=True)
    
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Patched", "Patched"),
        ("False Positive", "False Positive"),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="Pending",
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_report_findings"
    )

# -----------------------
# FINAL (COMPUTED) VALUES
# -----------------------
    @property
    def final_title(self):
        default = ""
        if self.vulnerability:
            default = self.vulnerability.title or ""

        if self.tester_title:
            return self.tester_title

        return default
    
    @property
    def final_severity(self):
        default = ""
        if self.vulnerability:
            default = self.vulnerability.severity or ""

        if self.tester_severity:
            return self.tester_severity

        return default
    
    
    @property
    def final_description(self):
        default = ""
        if self.vulnerability:
            default = self.vulnerability.description or ""

        if self.tester_description:
            if default:
                return f"{default}\n\n{self.tester_description}"
            return self.tester_description

        return default

    @property
    def final_impact(self):
        default = ""
        if self.vulnerability:
            default = self.vulnerability.impact or ""

        if self.tester_impact:
            if default:
                return f"{default}\n\n{self.tester_impact}"
            return self.tester_impact

        return default

    @property
    def final_remediation(self):
        default = ""
        if self.vulnerability:
            default = self.vulnerability.remediation or ""

        if self.tester_remediation:
            if default:
                return f"{default}\n\n{self.tester_remediation}"
            return self.tester_remediation

        return default

class FindingEvidence(models.Model):
    finding = models.ForeignKey(
        ReportFinding,
        on_delete=models.CASCADE,
        related_name="evidences"
    )
    title = models.CharField(max_length=200, blank=True)
    file = models.FileField(upload_to="evidence/")
    description = models.TextField(blank=True)
    order = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_finding_evidences"
    )

    class Meta:
        ordering = ['order', 'created_at']


    def __str__(self):
        return self.title or f"Evidence for {self.finding.title}"

class Notification(models.Model):
    TYPE_CHOICES = [
        ("success", "Success"),
        ("error", "Error"),
        ("info", "Info"),
    ]
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default="info")
    is_read = models.BooleanField(default=False)
    link = models.URLField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.type.upper()}] {self.user.username} - {self.title}"

class AuditLog(models.Model):

    ACTION_CHOICES = [
        ("STATUS_CHANGE", "Status Change"),
        ("EXPORT_PDF", "Export PDF"),
        ("EXPORT_DOCX", "Export DOCX"),
        ("EMAIL_SENT", "Email Sent"),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    report_id = models.IntegerField()

    action = models.CharField(max_length=50, choices=ACTION_CHOICES)

    old_value = models.CharField(max_length=100, null=True, blank=True)
    new_value = models.CharField(max_length=100, null=True, blank=True)

    metadata = models.JSONField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user} - {self.action} - Report {self.report_id}" 