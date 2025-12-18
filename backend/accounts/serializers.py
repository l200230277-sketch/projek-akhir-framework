import re
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

    def validate_full_name(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Nama lengkap wajib diisi.")
        # Hanya huruf, spasi, dan beberapa karakter khusus (titik, koma)
        if not re.match(r'^[a-zA-Z\s\.\,\-\']+$', value):
            raise serializers.ValidationError("Nama hanya boleh berisi huruf, spasi, titik, koma, tanda hubung, dan apostrof.")
        return value.strip()

    def validate_nim(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("NIM wajib diisi.")
        value = value.strip()
        if len(value) > 10:
            raise serializers.ValidationError("NIM maksimal 10 karakter.")
        if not value.isdigit():
            raise serializers.ValidationError("NIM hanya boleh berisi angka.")
        return value

    def validate_angkatan(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Angkatan wajib diisi.")
        if len(value) != 4:
            raise serializers.ValidationError("Angkatan harus 4 digit.")
        if not value.isdigit():
            raise serializers.ValidationError("Angkatan hanya boleh berisi angka.")
        return value.strip()

    def validate_prodi(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Program studi wajib diisi.")
        # Hanya huruf, spasi, dan beberapa karakter khusus
        if not re.match(r'^[a-zA-Z\s\.\,\-\(\)]+$', value):
            raise serializers.ValidationError("Program studi hanya boleh berisi huruf, spasi, dan tanda baca.")
        return value.strip()

    def validate_email(self, value: str) -> str:
        if not value.strip():
            raise serializers.ValidationError("Email wajib diisi.")
        # Format: nim@student.ums.ac.id
        pattern = r'^[a-zA-Z0-9]+@student\.ums\.ac\.id$'
        if not re.match(pattern, value):
            raise serializers.ValidationError("Email harus menggunakan format: nim@student.ums.ac.id")
        return value.strip()

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def validate(self, attrs):
        # Cross-field validation: NIM di email harus sama dengan NIM yang diinput
        email = attrs.get('email', '')
        nim = attrs.get('nim', '')
        if email and nim:
            email_nim = email.split('@')[0]
            if email_nim != nim:
                raise serializers.ValidationError({
                    'email': 'NIM di email harus sama dengan NIM yang diinput.',
                    'nim': 'NIM di email harus sama dengan NIM yang diinput.'
                })
        return attrs

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


