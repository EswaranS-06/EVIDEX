from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Role, UserProfile
from .serializers import RegisterSerializer, UserManagementSerializer
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes
from django.contrib.auth.models import User

class LoginView(TokenObtainPairView):
    permission_classes = [AllowAny]

class RefreshTokenView(TokenRefreshView):
    permission_classes = [IsAuthenticated]

class RegisterUserView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=RegisterSerializer,
        responses={201: OpenApiTypes.OBJECT, 400: OpenApiTypes.OBJECT},
        description="Register a new user",
    )
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        # Assign default role = User
        default_role = get_object_or_404(Role, name="User")
        profile, created = UserProfile.objects.get_or_create(user=user, defaults={'role': default_role})
        if not created and not profile.role:
            profile.role = default_role
            profile.save()

        return Response({
            "message": "User created successfully",
            "username": user.username,
            "role": default_role.name
        }, status=201)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 401: OpenApiTypes.OBJECT},
        description="Get current user's profile",
    )
    def get(self, request):
        profile = UserProfile.objects.filter(user=request.user).first()
        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": profile.role.name if profile and profile.role else None
        })

class UserManagementViewSet(APIView):
    permission_classes = [IsAuthenticated]

    def get_role(self, user):
        from .utils.role_utils import get_role as gr
        return gr(user)

    def get(self, request):
        if self.get_role(request.user) != "Admin":
            return Response({"detail": "Not authorized"}, status=403)
        
        users = User.objects.all().select_related('userprofile', 'userprofile__role')
        serializer = UserManagementSerializer(users, many=True)
        return Response(serializer.data)

class UserManagementUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_role(self, user):
        from .utils.role_utils import get_role as gr
        return gr(user)

    def patch(self, request, pk):
        if self.get_role(request.user) != "Admin":
            return Response({"detail": "Not authorized"}, status=403)
        
        user = get_object_or_404(User, pk=pk)
        profile, created = UserProfile.objects.get_or_create(user=user)
        
        old_role = profile.role.name if profile.role else "None"
        
        role_id = request.data.get('role_id')
        if role_id:
            new_role_obj = get_object_or_404(Role, pk=role_id)
            profile.role = new_role_obj
            profile.save()
            
            # Log the action
            from apps.knowledge.models import AuditLog
            AuditLog.objects.create(
                user=request.user,
                action="ROLE_CHANGE",
                old_value=f"User {user.username}: {old_role}",
                new_value=f"User {user.username}: {new_role_obj.name}",
                metadata={"target_user_id": user.id, "target_username": user.username}
            )
            
            # Create notification for target user
            from apps.knowledge.models import Notification
            Notification.objects.create(
                user=user,
                title="Role Updated",
                message=f"Administrator has changed your role to {new_role_obj.name}.",
                type="info"
            )
            
            return Response({"message": f"Role updated to {new_role_obj.name}"})
        
        return Response({"error": "role_id is required"}, status=400)

class RoleListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        roles = Role.objects.all()
        return Response([{"id": r.id, "name": r.name} for r in roles])