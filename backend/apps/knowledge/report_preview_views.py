from collections import defaultdict

from django.http import HttpResponse, Http404
from django.template.loader import render_to_string
from django.contrib.auth.decorators import login_required

from apps.knowledge.models import Report, ReportFinding


@login_required
def report_preview(request, report_id):
    try:
        report = Report.objects.get(id=report_id)
    except Report.DoesNotExist:
        raise Http404("Report not found")

    findings_qs = ReportFinding.objects.filter(report=report)

    # ----------------------------
    # Severity aggregation
    # ----------------------------
    severity_counts = {
        "CRITICAL": findings_qs.filter(severity="CRITICAL").count(),
        "HIGH": findings_qs.filter(severity="HIGH").count(),
        "MEDIUM": findings_qs.filter(severity="MEDIUM").count(),
        "LOW": findings_qs.filter(severity="LOW").count(),
    }

    # ----------------------------
    # Build dynamic Action Plan
    # ----------------------------
    severity_counter = defaultdict(int)
    remediation_set = set()

    for f in findings_qs:
        severity_counter[f.severity] += 1
        if f.remediation:
            remediation_set.add(f.remediation.strip())

    action_plan = {
        "severity_count": dict(severity_counter),
        "actions": sorted(remediation_set),
    }

    # ----------------------------
    # Prepare findings for template
    # ----------------------------
    findings = []

    for f in findings_qs:
        findings.append({
            "title": f.title,
            "severity": f.severity,
            "description": f.description,
            "impact": f.impact,
            "remediation": f.remediation,
            "evidences": [
                {
                    "title": e.title,
                    "file": e.file.url,
                    "description": e.description,
                }
                for e in f.evidences.all()
            ],
        })


    # ----------------------------
    # Context for template
    # ----------------------------
    context = {
        "report": {
            "client_name": report.client_name,
            "application_name": report.application_name,
            "report_type": report.report_type,
            "report_date": f"{report.start_date} to {report.end_date}",
            "prepared_by": report.prepared_by,
        },
        "summary": {
            "severity": {
                "critical": severity_counts["CRITICAL"],
                "high": severity_counts["HIGH"],
                "medium": severity_counts["MEDIUM"],
                "low": severity_counts["LOW"],
            }
        },
        "findings": findings,
        "action_plan": action_plan,
    }

    html = render_to_string("reports/cover.html", context)
    return HttpResponse(html)
