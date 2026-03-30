from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.accounts.utils.role_utils import get_role

class KnowledgePermission(BasePermission):
    """
    Controls access to knowledge module
    """

    def has_permission(self, request, view):
        role = get_role(request.user)

        # Tester → full access
        if role == "Tester":
            return True

        # Others → read-only
        if role in ["Reviewer", "Approver", "User"]:
            return request.method in SAFE_METHODS

        return False
