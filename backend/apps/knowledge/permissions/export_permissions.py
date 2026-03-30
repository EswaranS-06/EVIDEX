from rest_framework.permissions import BasePermission
from apps.accounts.utils.role_utils import get_role


class CanExportReport(BasePermission):
    """
    Controls who can export/download reports
    """

    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)

        # Tester → full access
        if role == "Tester":
            return True

        # Reviewer & Approver → can export all
        if role in ["Reviewer", "Approver"]:
            return True

        # User → only assigned + completed
        if role == "User":
            return (
                obj.assigned_to == request.user and
                obj.status == "completed"
            )

        return False


class CanEmailReport(BasePermission):
    """
    Controls who can email reports
    """

    def has_permission(self, request, view):
        role = get_role(request.user)

        return role in ["Tester", "Reviewer", "Approver"]
