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
    ReportFindingDetailView,
    EvidenceListCreateView,
    EvidenceDeleteView,
)

from .report_preview_views import report_preview
from .report_pdf_views import report_pdf

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
        "findings/<int:pk>/",
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
    
    # ✅ ONLY ONE preview route (WITH int)
    path("api/reports/<int:report_id>/preview/", report_preview),
    
    path("api/reports/<int:report_id>/pdf/", report_pdf),
    
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
