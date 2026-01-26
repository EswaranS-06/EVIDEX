from django.shortcuts import render
from django.contrib.auth import authenticate
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import status

from .models import Role, UserProfile
from .serializers import RegisterSerializer

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {'error': 'username and password are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )

        refresh = RefreshToken.for_user(user)
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        })

class RegisterUserView(APIView):
    permission_classes = [AllowAny]


    # class RegisterUserView(APIView): #secure feature off for now
    #     permission_classes = [IsAuthenticated]  # later we’ll restrict to Admin

    def post(self, request):
        try:
            serializer = RegisterSerializer(data=request.data)
            if not serializer.is_valid():
                return Response(
                    {'error': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = serializer.save()

            # assign default role = Pentester
            try:
                pentester_role = Role.objects.get(name="Pentester")
            except Role.DoesNotExist:
                # Create role if it doesn't exist
                pentester_role = Role.objects.create(
                    name="Pentester",
                    description="Penetration Tester"
                )

            UserProfile.objects.create(user=user, role=pentester_role)

            return Response({
                "message": "User created successfully",
                "username": user.username,
                "email": user.email,
                "role": "Pentester"
            }, status=status.HTTP_201_CREATED)

        except Exception as e:
            import traceback
            print(f"Registration error: {str(e)}")
            print(traceback.format_exc())
            
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile = UserProfile.objects.get(user=request.user)

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": profile.role.name if profile.role else None
        })