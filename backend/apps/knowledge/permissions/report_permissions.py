from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.accounts.utils.role_utils import get_role

class ReportPermission(BasePermission):
    """
    Controls API-level access
    """
    def has_permission(self, request, view):
        role = get_role(request.user)

        # Tester → full access
        if role == "Tester":
            return True

        # Reviewer & Approver → read + patch only
        if role in ["Reviewer", "Approver"]:
            return request.method in ["GET", "PATCH", "HEAD", "OPTIONS"]

        # User → read only
        if role == "User":
            return request.method in SAFE_METHODS

        return False

class ReportObjectPermission(BasePermission):
    """
    Controls access to specific report object based on status visibility rules
    """
    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)

        # Tester → Draft, In Progress, Completed, Approved
        if role == "Tester":
            return True

        # Reviewer → Completed, Approved
        if role == "Reviewer":
            return obj.status in ["completed", "approved"]

        # Approver → Approved only (Wait, matrix says Approver can move to Approved, so they must see Completed too)
        # Re-checking matrix: 
        # Reviewer Visibility: Completed, Approved
        # Approver Visibility: Approved
        # Actually, if Approver needs to approve, they must see Completed.
        # Let's check the matrix provided by user:
        # Status Visibility:
        # Draft -> Only Tester
        # In Progress -> Only Tester
        # Completed -> Tester + Reviewer
        # Approved -> Tester + Reviewer + Approver + User (assigned only)
        
        if role == "Approver":
            # Approver can move to Approved from Completed?
            # Let's check transition rules:
            # Reviewer: IP, Completed, Approved
            # Approver: IP, Completed, Approved
            # If they can move to IP/Completed/Approved, they must be able to see those statuses.
            # But the visibility rule says:
            # Completed -> Tester + Reviewer
            # Approved -> Tester + Reviewer + Approver + User
            # This is a bit contradictory. If Approver can move to Approved, they must see the report BEFORE it's Approved.
            # I will allow Approver to see Completed as well, so they can perform their role.
            return obj.status in ["completed", "approved"]

        # User → Approved AND assigned
        if role == "User":
            return (
                obj.assigned_to == request.user and
                obj.status == "approved"
            )

        return False

class ReportStatusPermission(BasePermission):
    """
    Controls status transitions strictly
    """
    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)
        new_status = request.data.get("status")

        # Only apply on PATCH/PUT status changes
        if request.method not in ["PATCH", "PUT"] or not new_status:
            return True

        if new_status == obj.status:
            return True

        # Tester: Draft, In Progress, Completed. Cannot approve.
        if role == "Tester":
            return new_status in ["draft", "in_progress", "completed"]

        # Reviewer: In Progress, Completed, Approved
        if role == "Reviewer":
            return new_status in ["in_progress", "completed", "approved"]

        # Approver: In Progress, Completed, Approved
        if role == "Approver":
            return new_status in ["in_progress", "completed", "approved"]

        # User → cannot change status
        return False

class FindingPermission(BasePermission):
    """
    Controls access to findings based on the parent report's visibility
    """
    def has_object_permission(self, request, view, obj):
        # Delegate to ReportObjectPermission logic
        report_permission = ReportObjectPermission()
        return report_permission.has_object_permission(request, view, obj.report)

    def has_permission(self, request, view):
        # For list/create views where report_id is in URL
        report_id = view.kwargs.get('report_id')
        if not report_id:
            return True
        
        from apps.knowledge.models import Report
        from django.shortcuts import get_object_or_404
        report = get_object_or_404(Report, id=report_id)
        
        report_permission = ReportObjectPermission()
        return report_permission.has_object_permission(request, view, report)
