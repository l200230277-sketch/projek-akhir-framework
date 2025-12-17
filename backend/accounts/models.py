from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Roles(models.TextChoices):
        MAHASISWA = "MAHASISWA", "Mahasiswa"
        ADMIN = "ADMIN", "Admin"

    email = models.EmailField(unique=True)
    full_name = models.CharField(max_length=150, blank=True)
    role = models.CharField(
        max_length=20, choices=Roles.choices, default=Roles.MAHASISWA
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return self.email



