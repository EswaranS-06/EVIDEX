from collections import defaultdict
from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required
from django.conf import settings

from apps.knowledge.models import Report, ReportFinding


@login_required
def report_preview(request, report_id):
    try:
        report = Report.objects.get(id=report_id)
    except Report.DoesNotExist:
        raise Http404("Report not found")

    # Load findings with all needed relations
    findings_qs = (
        ReportFinding.objects
        .filter(report=report)
        .select_related("vulnerability")
        .prefetch_related("evidences")
    )

    # ----------------------------
    # Severity aggregation (FINAL)
    # ----------------------------
    severity_counts = {
        "CRITICAL": 0,
        "HIGH": 0,
        "MEDIUM": 0,
        "LOW": 0,
    }

    for f in findings_qs:
        if f.final_severity in severity_counts:
            severity_counts[f.final_severity] += 1

    # ----------------------------
    # Action Plan (FINAL)
    # ----------------------------
    severity_counter = defaultdict(int)
    remediation_set = set()

    for f in findings_qs:
        if f.final_severity:
            severity_counter[f.final_severity] += 1
        if f.final_remediation:
            remediation_set.add(f.final_remediation.strip())

    action_plan = {
        "severity_count": dict(severity_counter),
        "actions": sorted(remediation_set),
    }

    # ----------------------------
    # Context
    # We pass MODEL OBJECTS so:
    #   f.final_title
    #   f.final_severity
    #   f.evidences.all
    # all work in the template
    # ----------------------------
    context = {
        "report": report,
        "summary": {
            "severity": {
                "critical": severity_counts["CRITICAL"],
                "high": severity_counts["HIGH"],
                "medium": severity_counts["MEDIUM"],
                "low": severity_counts["LOW"],
            }
        },
        "findings": findings_qs,
        "action_plan": action_plan,
        "MEDIA_URL":request.build_absolute_uri(settings.MEDIA_URL),
        "is_pdf": False,
    }

    # IMPORTANT: pass request so MEDIA_URL works in browser
    html = render_to_string("reports/cover.html", context, request=request)
    return HttpResponse(html)
