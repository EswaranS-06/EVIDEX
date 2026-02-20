from django.urls import path
from .views import MeView, RegisterUserView, LoginView, RefreshTokenView

urlpatterns = [
    path("login/", LoginView.as_view(), name="login"),
    path("refresh/", RefreshTokenView.as_view(), name="refresh"),
    path("me/", MeView.as_view(), name="me"),
    path("register/", RegisterUserView.as_view(), name="register"),
]
