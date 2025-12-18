from django.contrib.auth import get_user_model
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


User = get_user_model()


class EmailLowercaseTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializer kustom untuk login JWT yang memastikan email selalu lowercase,
    sehingga pengguna tidak bingung soal huruf besar/kecil saat login.
    """

    def validate(self, attrs):
        email = attrs.get(self.username_field)
        if isinstance(email, str):
            attrs[self.username_field] = email.strip().lower()
        return super().validate(attrs)


