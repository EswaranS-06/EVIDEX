from rest_framework.permissions import BasePermission, SAFE_METHODS
from apps.accounts.utils.role_utils import get_role

class KnowledgePermission(BasePermission):
    """
    Controls access to the Knowledge Module.
    Tester: Full CRUD access
    Reviewer/Approver/User: Read-only access
    """

    def has_permission(self, request, view):
        # 1. Ensure user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # 2. Get role from utility
        role = get_role(request.user)

        # 3. Handle Admin role (UNRESTRICTED)
        if role == "Admin":
            return True

        # 4. Handle Tester role (FULL ACCESS)
        if role == "Tester":
            return True

        # 5. Handle Read-Only roles (GET, HEAD, OPTIONS)
        if role in ["Reviewer", "Approver", "User"]:
            return request.method in SAFE_METHODS

        return False
