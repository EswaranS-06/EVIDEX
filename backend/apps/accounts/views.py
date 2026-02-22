from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .models import Role, UserProfile
from .serializers import RegisterSerializer
from drf_spectacular.utils import extend_schema
from drf_spectacular.types import OpenApiTypes


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

        # assign default role = Pentester
        pentester_role = get_object_or_404(Role, name="Pentester")
        UserProfile.objects.create(user=user, role=pentester_role)

        return Response({
            "message": "User created successfully",
            "username": user.username,
            "role": "Pentester"
        }, status=201)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        responses={200: OpenApiTypes.OBJECT, 401: OpenApiTypes.OBJECT},
        description="Get current user's profile",
    )
    def get(self, request):
        profile = UserProfile.objects.get(user=request.user)

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": profile.role.name if profile.role else None
        })