from django.urls import path
from .report_preview_views import ReportPreviewView
from .reports.report_pdf_views import ReportPDFView, SendReportEmailView
from .report_docx_views import ReportDOCXView

from .views import (
    OWASPCategoryListCreateView,
    OWASPCategoryDetailView,
    OWASPVulnerabilityListCreateView,
    OWASPVulnerabilityDetailView,
    VulnerabilityVariantListCreateView,
    VulnerabilityVariantDetailView,
    VariantsByVulnerabilityView,
    VulnerabilityDefinitionListCreateView,
    VulnerabilityDefinitionDetailView,
    NotificationListView,
    NotificationReadView,
    NotificationClearView,
)

from .rbac_views import (
    RBACMatrixView,
    RBACStatusTransitionsView,
    RBACSecurityRulesView,
    AuditLogListView,
)

from .report_views import (
    ReportViewSet,
    ReportFindingListCreateView,
    BulkReportFindingsView,
    ReportFindingDetailView,
    EvidenceListCreateView,
    EvidenceDeleteView,
    EvidenceReorderView,
)

urlpatterns = [
    # -----------------------
    # OWASP APIs
    # -----------------------
    path("owasp/categories/", OWASPCategoryListCreateView.as_view()),
    path("owasp/categories/<int:pk>/", OWASPCategoryDetailView.as_view()),
    path("owasp/vulnerabilities/", OWASPVulnerabilityListCreateView.as_view()),
    path("owasp/vulnerabilities/<int:pk>/", OWASPVulnerabilityDetailView.as_view()),
    path("owasp/variants/", VulnerabilityVariantListCreateView.as_view()),
    path("owasp/variants/<int:pk>/", VulnerabilityVariantDetailView.as_view()),
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
        "findings/<int:finding_id>/evidences/reorder/",
        EvidenceReorderView.as_view(),
    ),
    path(
        "evidences/<int:pk>/",
        EvidenceDeleteView.as_view(),
    ),

    # -----------------------
    # NOTIFICATION APIs
    # -----------------------
    path("notifications/", NotificationListView.as_view(), name="notification-list"),
    path("notifications/clear/", NotificationClearView.as_view(), name="notification-clear"),
    path("notifications/<int:pk>/read/", NotificationReadView.as_view(), name="notification-read"),
    
    
    # ✅ Report Preview and PDF APIs with JWT Auth
    path("reports/<int:report_id>/preview/", ReportPreviewView.as_view(), name="report-preview"),
    path("reports/<int:report_id>/pdf/", ReportPDFView.as_view(), name="report-pdf"),
    path("reports/<int:report_id>/docx/", ReportDOCXView.as_view(), name="report-docx"),
    path("send-report-email/", SendReportEmailView.as_view(), name="send-report-email"),

    # -----------------------
    # ✅ ADMIN RBAC APIs
    # -----------------------
    path("rbac/matrix/", RBACMatrixView.as_view(), name="rbac-matrix"),
    path("rbac/status-transitions/", RBACStatusTransitionsView.as_view(), name="rbac-status-transitions"),
    path("rbac/security-rules/", RBACSecurityRulesView.as_view(), name="rbac-security-rules"),
    path("audit/logs/", AuditLogListView.as_view(), name="audit-logs"),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
