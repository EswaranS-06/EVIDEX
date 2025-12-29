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


    # class RegisterUserView(APIView): #secure feature off for now
    #     permission_classes = [IsAuthenticated]  # later we’ll restrict to Admin

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
        })

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