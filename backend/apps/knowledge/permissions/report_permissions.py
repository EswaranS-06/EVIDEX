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

        # Reviewer → only completed and approved
        if role == "Reviewer":
            return obj.status in ["completed", "approved"]

        # Approver → only approved
        if role == "Approver":
            return obj.status == "approved"

        # User → only assigned + approved
        if role == "User":
            return (
                obj.assigned_to == request.user and
                obj.status in ["completed", "approved"]
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

        # Tester
        if role == "Tester":
            return new_status in ["draft", "in_progress", "completed"]

        # Reviewer
        if role == "Reviewer":
            return new_status in ["in_progress", "completed", "approved"]

        # Approver
        if role == "Approver":
            return new_status in ["in_progress", "completed", "approved"]

        # User → cannot change status
        return False
