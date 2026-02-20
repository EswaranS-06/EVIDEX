# from django.shortcuts import render

# from rest_framework.views import APIView
# from rest_framework.response import Response
# from rest_framework.permissions import IsAuthenticated, AllowAny
# from django.shortcuts import get_object_or_404
# from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
# from django.contrib.auth import authenticate

# from .models import Role, UserProfile
# from .serializers import RegisterSerializer
# from drf_spectacular.utils import extend_schema
# from drf_spectacular.types import OpenApiTypes

# class LoginView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         username = request.data.get('username')
#         password = request.data.get('password')

#         if not username or not password:
#             return Response(
#                 {'error': 'username and password are required'},
#                 status=status.HTTP_400_BAD_REQUEST
#             )

#         user = authenticate(username=username, password=password)

#         if user is None:
#             return Response(
#                 {'error': 'Invalid credentials'},
#                 status=status.HTTP_401_UNAUTHORIZED
#             )

#         refresh = RefreshTokenView.for_user(user)
#         return Response({
#             'access': str(refresh.access_token),
#             'refresh': str(refresh),
#         })
# class RefreshTokenView(TokenRefreshView):
#     permission_classes = [IsAuthenticated]

# class RegisterUserView(APIView):
#     permission_classes = [AllowAny]


#     # class RegisterUserView(APIView): #secure feature off for now
#     #     permission_classes = [IsAuthenticated]  # later we’ll restrict to Admin

#     def post(self, request):
#         try:
#             serializer = RegisterSerializer(data=request.data)
#             if not serializer.is_valid():
#                 return Response(
#                     {'error': serializer.errors},
#                     status=status.HTTP_400_BAD_REQUEST
#                 )

#             user = serializer.save()

#             # assign default role = Pentester
#             try:
#                 pentester_role = Role.objects.get(name="Pentester")
#             except Role.DoesNotExist:
#                 # Create role if it doesn't exist
#                 pentester_role = Role.objects.create(
#                     name="Pentester",
#                     description="Penetration Tester"
#                 )

#             UserProfile.objects.create(user=user, role=pentester_role)

#             return Response({
#                 "message": "User created successfully",
#                 "username": user.username,
#                 "email": user.email,
#                 "role": "Pentester"
#             }, status=status.HTTP_201_CREATED)

#         except Exception as e:
#             import traceback
#             print(f"Registration error: {str(e)}")
#             print(traceback.format_exc())
            
#             return Response(
#                 {'error': str(e)},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR
#             )

# class MeView(APIView):
#     permission_classes = [IsAuthenticated]

#     @extend_schema(
#         responses={200: OpenApiTypes.OBJECT, 401: OpenApiTypes.OBJECT},
#         description="Get current user's profile",
#     )
#     def get(self, request):
#         profile = UserProfile.objects.get(user=request.user)

#         return Response({
#             "id": request.user.id,
#             "username": request.user.username,
#             "email": request.user.email,
#             "role": profile.role.name if profile.role else None
#         })

from django.shortcuts import render

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Role, UserProfile
from .serializers import RegisterSerializer

from rest_framework.permissions import AllowAny

class RegisterUserView(APIView):
    permission_classes = [AllowAny]
    

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
    def get(self, request):
        profile = UserProfile.objects.get(user=request.user)

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "email": request.user.email,
            "role": profile.role.name if profile.role else None
        })