from django.contrib import admin
from .models import Report, ReportFinding
from .models import ReportFinding, FindingEvidence
from .models import (
    OWASPCategory,
    OWASPVulnerability,
    VulnerabilityVariant,
    VulnerabilityDefinition,
)

admin.site.register(OWASPCategory)
admin.site.register(OWASPVulnerability)
admin.site.register(VulnerabilityVariant)
admin.site.register(VulnerabilityDefinition)
admin.site.register(Report)



class FindingEvidenceInline(admin.TabularInline):
    model = FindingEvidence
    extra = 1


@admin.register(ReportFinding)
class ReportFindingAdmin(admin.ModelAdmin):
    list_display = ("title", "severity", "report")
    inlines = [FindingEvidenceInline]