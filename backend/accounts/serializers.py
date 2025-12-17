from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from talents.models import StudentProfile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name", "role"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    nim = serializers.CharField(write_only=True)
    prodi = serializers.CharField(write_only=True)
    angkatan = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "full_name",
            "password",
            "nim",
            "prodi",
            "angkatan",
        ]

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def create(self, validated_data):
        nim = validated_data.pop("nim")
        prodi = validated_data.pop("prodi")
        angkatan = validated_data.pop("angkatan")
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        
        # Set username sama dengan email karena USERNAME_FIELD = "email"
        user = User(username=email, email=email, **validated_data)
        user.set_password(password)
        user.save()

        StudentProfile.objects.create(
            user=user,
            nim=nim,
            prodi=prodi,
            angkatan=angkatan,
        )
        return user


