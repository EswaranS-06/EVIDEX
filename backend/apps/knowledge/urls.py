from django.urls import path
from .views import (
    OWASPCategoryListCreateView,
    OWASPVulnerabilityListCreateView,
    OWASPVulnerabilityDetailView,
    VulnerabilityVariantListCreateView,
    VariantsByVulnerabilityView,
    VulnerabilityDefinitionListCreateView,
    VulnerabilityDefinitionDetailView,
)

urlpatterns = [
    # Categories
    path("owasp/categories/", OWASPCategoryListCreateView.as_view()),

    # OWASP Vulnerabilities
    path("owasp/vulnerabilities/", OWASPVulnerabilityListCreateView.as_view()),
    path("owasp/vulnerabilities/<int:pk>/", OWASPVulnerabilityDetailView.as_view()),

    # Variants
    path("owasp/variants/", VulnerabilityVariantListCreateView.as_view()),
    path(
        "owasp/vulnerabilities/<int:vuln_id>/variants/",
        VariantsByVulnerabilityView.as_view(),
    ),

    # Vulnerability Definitions
    path("vulnerabilities/", VulnerabilityDefinitionListCreateView.as_view()),
    path(
        "vulnerabilities/<int:pk>/",
        VulnerabilityDefinitionDetailView.as_view(),
    ),
]
