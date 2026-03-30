from rest_framework.permissions import BasePermission
from apps.accounts.utils.role_utils import get_role


class RolePermission(BasePermission):
    """
    Generic role-based permission
    """
    allowed_roles = []

    def has_permission(self, request, view):
        role = get_role(request.user)
        return role in self.allowed_roles


class MethodRolePermission(BasePermission):
    """
    Role-based access per HTTP method
    """

    role_map = {
        "GET": [],
        "POST": [],
        "PATCH": [],
        "DELETE": []
    }

    def has_permission(self, request, view):
        role = get_role(request.user)
        allowed = self.role_map.get(request.method, [])
        return role in allowed


class BaseObjectPermission(BasePermission):
    """
    Base class for object-level checks
    """

    def has_object_permission(self, request, view, obj):
        return True  # override later
