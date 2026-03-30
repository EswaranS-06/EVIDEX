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
            return request.method in ["GET", "PATCH"]

        # User → read only
        if role == "User":
            return request.method in SAFE_METHODS

        return False

class ReportObjectPermission(BasePermission):
    """
    Controls access to specific report object
    """
    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)

        # Tester → full access
        if role == "Tester":
            return True

        # Reviewer & Approver → can see all reports
        if role in ["Reviewer", "Approver"]:
            return True

        # User → only assigned + completed
        if role == "User":
            return (
                obj.assigned_to == request.user and
                obj.status == "completed"
            )

        return False

class ReportStatusPermission(BasePermission):
    """
    Controls status transitions
    """
    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)
        new_status = request.data.get("status")

        # Only apply on PATCH
        if request.method != "PATCH":
            return True

        # Tester → full control
        if role == "Tester":
            return True

        if not new_status:
            return False  # must send status

        # Reviewer rules
        if role == "Reviewer":
            return new_status in ["verified", "in_progress"]

        # Approver rules
        if role == "Approver":
            return new_status in ["verified", "completed"]

        # User → cannot change status
        return False
