from django.urls import path, include
from .views import (
    MeView, RegisterUserView, LoginView, RefreshTokenView,
    UserManagementViewSet, UserManagementUpdateView, RoleListView
)

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshTokenView.as_view(), name="refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("register/", RegisterUserView.as_view(), name="register"),

    # Admin Management
    path("users/", UserManagementViewSet.as_view(), name="admin-users"),
    path("users/<int:pk>/role/", UserManagementUpdateView.as_view(), name="admin-user-role-update"),
    path("roles/", RoleListView.as_view(), name="admin-roles"),
]
