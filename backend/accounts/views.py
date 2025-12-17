from django.contrib.auth import get_user_model
from rest_framework import generics, permissions
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import RegisterSerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    Endpoint untuk registrasi mahasiswa baru.
    """

    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]


class MeView(generics.RetrieveAPIView):
    """
    Mengambil data user yang sedang login.
    """

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class LoginView(TokenObtainPairView):
    """
    Wrapper supaya URL login lebih konsisten di namespace accounts.
    """

    pass



