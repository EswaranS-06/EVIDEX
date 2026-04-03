from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, BasePermission
from apps.accounts.utils.role_utils import get_role
from .models import AuditLog, Report
from django.db.models import Count

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return get_role(request.user) == "Admin"

class RBACMatrixView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        # This is a static representation of the backend enforcement logic
        matrix = [
            {
                "role": "Tester",
                "permissions": ["Create", "Edit", "Delete", "View", "Export", "Email"],
                "status_access": ["Draft", "In Progress", "Completed"]
            },
            {
                "role": "Reviewer",
                "permissions": ["View", "Export", "Email"],
                "status_access": ["Completed", "Approved"]
            },
            {
                "role": "Approver",
                "permissions": ["View", "Export", "Email"],
                "status_access": ["Completed", "Approved"]
            },
            {
                "role": "User",
                "permissions": ["View", "Export (Internal)"],
                "status_access": ["Approved (Assigned Only)"]
            }
        ]
        return Response(matrix)

class RBACStatusTransitionsView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        transitions = [
            {"from": "Draft", "to": "In Progress", "roles": ["Tester"]},
            {"from": "In Progress", "to": "Completed", "roles": ["Tester", "Reviewer", "Approver"]},
            {"from": "Completed", "to": "Approved", "roles": ["Reviewer", "Approver"]},
            {"from": "Approved", "to": "In Progress", "roles": ["Reviewer", "Approver"]},
        ]
        return Response(transitions)

class RBACSecurityRulesView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        rules = [
            {"rule": "IDOR Prevention", "status": "Active", "description": "Strict ownership/visibility checks on all object-level APIs"},
            {"rule": "Role Escalation Block", "status": "Active", "description": "Middleware ensures users cannot change their own roles"},
            {"rule": "Metadata Protection", "status": "Active", "description": "prepared_by, reviewed_by, approved_by are automated and read-only"},
            {"rule": "Export Restriction", "status": "Active", "description": "Users can only export approved reports assigned to them"}
        ]
        return Response(rules)

class AuditLogListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        target_id = request.query_params.get('target_user_id')
        logs = AuditLog.objects.all().select_related('user')
        
        if target_id:
            # Filter logs where metadata contains target_user_id
            logs = logs.filter(metadata__target_user_id=int(target_id))
            
        logs = logs.order_by("-created_at")[:100]
        
        data = [
            {
                "id": log.id,
                "user": log.user.username if log.user else "System",
                "action": log.action,
                "report_id": log.report_id,
                "old_value": log.old_value,
                "new_value": log.new_value,
                "metadata": log.metadata,
                "timestamp": log.created_at
            } for log in logs
        ]
        return Response(data)
