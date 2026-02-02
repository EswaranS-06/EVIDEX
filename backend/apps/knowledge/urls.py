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

from .report_views import (
    ReportViewSet,
    ReportFindingListCreateView,
    BulkReportFindingsView,
    ReportFindingDetailView,
    EvidenceListCreateView,
    EvidenceDeleteView,
)

urlpatterns = [
    # -----------------------
    # OWASP APIs
    # -----------------------
    path("owasp/categories/", OWASPCategoryListCreateView.as_view()),
    path("owasp/vulnerabilities/", OWASPVulnerabilityListCreateView.as_view()),
    path("owasp/vulnerabilities/<int:pk>/", OWASPVulnerabilityDetailView.as_view()),
    path("owasp/variants/", VulnerabilityVariantListCreateView.as_view()),
    path(
        "owasp/vulnerabilities/<int:vuln_id>/variants/",
        VariantsByVulnerabilityView.as_view(),
    ),

    # -----------------------
    # Vulnerability Definitions
    # -----------------------
    path("vulnerabilities/", VulnerabilityDefinitionListCreateView.as_view()),
    path("vulnerabilities/<int:pk>/", VulnerabilityDefinitionDetailView.as_view()),

    # -----------------------
    # REPORT APIs
    # -----------------------
    path(
        "reports/",
        ReportViewSet.as_view({
            "get": "list",
            "post": "create",
        }),
    ),
    path(
        "reports/<int:pk>/",
        ReportViewSet.as_view({
            "get": "retrieve",
            "patch": "partial_update",
            "delete": "destroy",
        }),
    ),

    # -----------------------
    # REPORT FINDINGS APIs
    # -----------------------
    path(
        "reports/<int:report_id>/findings/",
        ReportFindingListCreateView.as_view(),
    ),
    path(
        "reports/<int:report_id>/bulk-findings/",
        BulkReportFindingsView.as_view(),
    ),
    path(
        "findings/<int:pk>/",
        ReportFindingDetailView.as_view(),
    ),
    path(
        "reports/<int:report_id>/findings/<int:pk>/",
        ReportFindingDetailView.as_view(),
    ),

    # -----------------------
    # ✅ EVIDENCE APIs (FIXED)
    # -----------------------
    path(
        "findings/<int:finding_id>/evidences/",
        EvidenceListCreateView.as_view(),
    ),
    path(
        "evidences/<int:pk>/",
        EvidenceDeleteView.as_view(),
    ),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
