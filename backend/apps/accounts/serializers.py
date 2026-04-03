from django.contrib.auth.models import User
from rest_framework import serializers
from .models import UserProfile, Role

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"]
        )
        return user

class UserManagementSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='userprofile.role.name', read_only=True)
    role_id = serializers.IntegerField(source='userprofile.role.id', write_only=True, required=False)

    class Meta:
        model = User
        fields = ("id", "username", "email", "role", "role_id")
