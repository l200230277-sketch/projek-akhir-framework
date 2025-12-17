from django.conf import settings
from django.db import models


class StudentProfile(models.Model):
    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profile",
    )
    nim = models.CharField(max_length=20, unique=True)
    prodi = models.CharField(max_length=100)
    angkatan = models.CharField(max_length=4)
    headline = models.CharField(max_length=150, blank=True)
    bio = models.TextField(blank=True)
    photo = models.ImageField(upload_to="profiles/", blank=True, null=True)
    is_public = models.BooleanField(default=True)
    is_active = models.BooleanField(default=True)
    views_count = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:  # pragma: no cover - simple repr
        return f"{self.user.full_name or self.user.email} ({self.nim})"


class Skill(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self) -> str:  # pragma: no cover
        return self.name


class StudentSkill(models.Model):
    class Level(models.TextChoices):
        BEGINNER = "Beginner", "Beginner"
        INTERMEDIATE = "Intermediate", "Intermediate"
        EXPERT = "Expert", "Expert"

    student = models.ForeignKey(
        StudentProfile, related_name="student_skills", on_delete=models.CASCADE
    )
    skill = models.ForeignKey(Skill, related_name="student_skills", on_delete=models.CASCADE)
    level = models.CharField(max_length=20, choices=Level.choices, default=Level.BEGINNER)
    endorsement_count = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ("student", "skill")

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.student.nim} - {self.skill.name}"


class Experience(models.Model):
    student = models.ForeignKey(
        StudentProfile, related_name="experiences", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=150)
    company = models.CharField(max_length=150)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    description = models.TextField(blank=True)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.title} @ {self.company}"


class PortfolioProject(models.Model):
    student = models.ForeignKey(
        StudentProfile, related_name="projects", on_delete=models.CASCADE
    )
    title = models.CharField(max_length=150)
    description = models.TextField(blank=True)
    link_demo = models.URLField(blank=True)
    link_repo = models.URLField(blank=True)

    def __str__(self) -> str:  # pragma: no cover
        return self.title


class SocialLink(models.Model):
    class Platform(models.TextChoices):
        EMAIL = "email", "Email"
        LINKEDIN = "linkedin", "LinkedIn"
        GITHUB = "github", "GitHub"
        INSTAGRAM = "instagram", "Instagram"
        OTHER = "other", "Lainnya"

    student = models.ForeignKey(
        StudentProfile, related_name="social_links", on_delete=models.CASCADE
    )
    platform = models.CharField(max_length=20, choices=Platform.choices)
    label = models.CharField(max_length=100, blank=True)
    url_or_handle = models.CharField(max_length=255)

    def __str__(self) -> str:  # pragma: no cover
        return f"{self.platform} - {self.url_or_handle}"


class ProfileView(models.Model):
    student = models.ForeignKey(
        StudentProfile, related_name="views", on_delete=models.CASCADE
    )
    viewer_ip = models.GenericIPAddressField(blank=True, null=True)
    viewed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-viewed_at"]


class Endorsement(models.Model):
    endorsed_skill = models.ForeignKey(
        StudentSkill, related_name="endorsements", on_delete=models.CASCADE
    )
    endorser = models.ForeignKey(
        StudentProfile,
        related_name="given_endorsements",
        on_delete=models.CASCADE,
    )
    message = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("endorsed_skill", "endorser")



