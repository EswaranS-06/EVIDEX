from rest_framework.permissions import BasePermission
from apps.accounts.utils.role_utils import get_role


class CanExportReport(BasePermission):
    """
    Controls who can export/download reports
    Rules:
    - Tester, Reviewer, Approver → always allowed
    - User → only if report is Approved AND assigned
    """

    def has_object_permission(self, request, view, obj):
        role = get_role(request.user)

        # Tester, Reviewer & Approver → full access
        if role in ["Tester", "Reviewer", "Approver"]:
            return True

        # User → only assigned + approved
        if role == "User":
            return (
                obj.assigned_to == request.user and
                obj.status == "approved"
            )

        return False


class CanEmailReport(BasePermission):
    """
    Controls who can email reports
    Rules:
    - Tester, Reviewer, Approver → allowed
    - User → not allowed
    """

    def has_permission(self, request, view):
        role = get_role(request.user)
        return role in ["Tester", "Reviewer", "Approver"]
