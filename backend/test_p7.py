import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.test import RequestFactory
from django.contrib.auth.models import User
from apps.accounts.models import Role, UserProfile
from apps.knowledge.models import Report, OWASPCategory, AuditLog
from apps.knowledge.report_views import ReportViewSet
from apps.knowledge.reports.report_pdf_views import ReportPDFView, SendReportEmailView
from apps.knowledge.views import OWASPCategoryListCreateView
from rest_framework.test import force_authenticate
from rest_framework.test import APIRequestFactory

def run_checks():
    def get_user(u): return User.objects.get(username=u)
    tester = get_user('tester123')
    reviewer = get_user('reviewer123')
    approver = get_user('approver123')
    client = get_user('client123')

    AuditLog.objects.all().delete()
    Report.objects.all().delete()
    
    r1 = Report.objects.create(created_by=tester, client_name="C1", application_name="A1", status="draft")
    r2 = Report.objects.create(created_by=tester, client_name="C2", application_name="A2", status="completed", assigned_to=client)

    rf = APIRequestFactory()

    def test(view_func, method, user, data=None, kwargs=None):
        req = getattr(rf, method.lower())('/api/', data or {}, format='json')
        if user: force_authenticate(req, user=user)
        try:
            return view_func(req, **(kwargs or {})).status_code
        except Exception as e:
            if hasattr(e, 'status_code'): return e.status_code
            return 500

    rvs = ReportViewSet.as_view({'patch': 'partial_update', 'get': 'retrieve'})
    print("Reviewer -> verified (200 expected):", test(rvs, "PATCH", reviewer, {"status":"verified"}, {"pk":r1.id}))
    print("Approver -> completed (200 expected):", test(rvs, "PATCH", approver, {"status":"completed"}, {"pk":r1.id}))
    
    pdf_v = ReportPDFView.as_view()
    print("Tester -> Export PDF (200 expected):", test(pdf_v, "POST", tester, None, {"report_id":r1.id}))
    print("IDOR Client -> PDF (403 expected):", test(pdf_v, "POST", client, None, {"report_id":r1.id}))

    print("Missing Object Client -> PDF (404 expected):", test(pdf_v, "POST", client, None, {"report_id":999999}))
    
    email_v = SendReportEmailView.as_view()
    from django.core.mail import EmailMessage
    original_send = EmailMessage.send
    EmailMessage.send = lambda self, fail_silently=False: 1 # mock send
    print("Tester -> Email (200 expected):", test(email_v, "POST", tester, {"report_id":r1.id, "email":"x@x.com", "attach_pdf":True}))
    # restore send
    EmailMessage.send = original_send

    print("\n--- AUDIT LOGS ---")
    for log in AuditLog.objects.all():
        print(f"Log: {log.action} | {log.old_value} -> {log.new_value} by {log.user.username}")

run_checks()
