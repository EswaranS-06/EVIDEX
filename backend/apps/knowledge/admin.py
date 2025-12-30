from django.contrib import admin
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
