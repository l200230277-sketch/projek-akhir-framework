from django.db.models import Q, Count
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, mixins, permissions, viewsets
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.exceptions import ValidationError

from .models import (
    Endorsement,
    Experience,
    PortfolioProject,
    Skill,
    SocialLink,
    StudentProfile,
    StudentSkill,
)
from .serializers import (
    EndorsementSerializer,
    ExperienceSerializer,
    PortfolioProjectSerializer,
    SkillSerializer,
    SocialLinkSerializer,
    StudentProfileSerializer,
    StudentProfileUpdateSerializer,
    StudentSkillSerializer,
)


class IsOwnerProfile(permissions.BasePermission):
    """
    Mengizinkan akses hanya untuk pemilik profil.
    """

    def has_object_permission(self, request, view, obj):
        if isinstance(obj, StudentProfile):
            return obj.user == request.user
        return getattr(obj, "student", None) and obj.student.user == request.user


class MyProfileView(generics.RetrieveUpdateAPIView):
    """
    Get / Update profil mahasiswa yang sedang login.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentProfileUpdateSerializer

    def get_object(self):
        return self.request.user.profile

    def get(self, request, *args, **kwargs):
        serializer = StudentProfileSerializer(self.get_object())
        return Response(serializer.data)


class MySkillViewSet(viewsets.ModelViewSet):
    """
    CRUD skill milik mahasiswa yang sedang login.
    """

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = StudentSkillSerializer

    def get_queryset(self):
        return StudentSkill.objects.select_related("student", "skill").filter(
            student=self.request.user.profile
        )

    def perform_create(self, serializer):
        skill_name = self.request.data.get("skill_name")
        if not skill_name or not skill_name.strip():
            raise ValidationError({"skill_name": "Skill wajib diisi."})
        skill_name = skill_name.strip()
        level = self.request.data.get("level", StudentSkill.Level.BEGINNER)
        skill, _ = Skill.objects.get_or_create(name=skill_name)
        # Check if student already has this skill
        existing = StudentSkill.objects.filter(
            student=self.request.user.profile,
            skill=skill
        ).first()
        if existing:
            raise ValidationError({"skill_name": "Skill ini sudah ada di profil Anda."})
        serializer.save(student=self.request.user.profile, skill=skill, level=level)


class MyExperienceViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ExperienceSerializer

    def get_queryset(self):
        return Experience.objects.filter(student=self.request.user.profile)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.profile)


class MyProjectViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerProfile]
    serializer_class = PortfolioProjectSerializer

    def get_queryset(self):
        return PortfolioProject.objects.filter(student=self.request.user.profile)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.profile)


class MySocialLinkViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated, IsOwnerProfile]
    serializer_class = SocialLinkSerializer

    def get_queryset(self):
        return SocialLink.objects.filter(student=self.request.user.profile)

    def perform_create(self, serializer):
        serializer.save(student=self.request.user.profile)


class PublicTalentListView(generics.ListAPIView):
    """
    List talenta publik dengan filter nama, skill, prodi.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = StudentProfileSerializer

    def get_queryset(self):
        qs = (
            StudentProfile.objects.select_related("user")
            .prefetch_related(
                "student_skills__skill",
                "experiences",
                "projects",
                "social_links",
            )
            .filter(is_public=True, is_active=True)
        )
        search = self.request.query_params.get("search")
        prodi = self.request.query_params.get("prodi")
        skill_name = self.request.query_params.get("skill")
        if search:
            qs = qs.filter(
                Q(user__full_name__icontains=search)
                | Q(nim__icontains=search)
                | Q(prodi__icontains=search)
                | Q(student_skills__skill__name__icontains=search)
            )
        if prodi:
            qs = qs.filter(prodi__iexact=prodi)
        if skill_name:
            qs = qs.filter(student_skills__skill__name__icontains=skill_name)
        return qs.distinct()


class LatestTalentListView(generics.ListAPIView):
    """
    5 talenta terbaru untuk halaman utama publik.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = StudentProfileSerializer

    def get_queryset(self):
        return (
            StudentProfile.objects.filter(is_public=True, is_active=True)
            .order_by("-created_at")[:5]
        )


class TalentDetailView(generics.RetrieveAPIView):
    """
    Detail satu talenta.
    """

    permission_classes = [permissions.AllowAny]
    serializer_class = StudentProfileSerializer
    queryset = StudentProfile.objects.select_related("user").prefetch_related(
        "student_skills__skill", "experiences", "projects", "social_links"
    )


class AdminTalentViewSet(viewsets.GenericViewSet, mixins.ListModelMixin):
    """
    Endpoint sederhana untuk admin melihat & mengaktif/nonaktifkan profil.
    """

    permission_classes = [permissions.IsAdminUser]
    serializer_class = StudentProfileSerializer
    queryset = StudentProfile.objects.select_related("user")

    @action(detail=True, methods=["post"])
    def deactivate(self, request, pk=None):
        profile = self.get_object()
        profile.is_active = False
        profile.save(update_fields=["is_active"])
        return Response({"status": "deactivated"})

    @action(detail=True, methods=["post"])
    def activate(self, request, pk=None):
        profile = self.get_object()
        profile.is_active = True
        profile.save(update_fields=["is_active"])
        return Response({"status": "activated"})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def statistics_view(request):
    """
    Endpoint untuk mendapatkan statistik publik.
    """
    total_talents = StudentProfile.objects.filter(is_public=True, is_active=True).count()
    total_skills = StudentSkill.objects.filter(student__is_public=True, student__is_active=True).values('skill').distinct().count()
    total_experiences = Experience.objects.filter(student__is_public=True, student__is_active=True).count()
    
    return Response({
        'total_talents': total_talents,
        'total_skills': total_skills,
        'total_experiences': total_experiences,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def top_talents_view(request):
    """
    Endpoint untuk mendapatkan top 2 talents dengan skill dan experience terbanyak.
    """
    talents = (
        StudentProfile.objects
        .filter(is_public=True, is_active=True)
        .annotate(
            skill_count=Count('student_skills'),
            experience_count=Count('experiences')
        )
        .order_by('-skill_count', '-experience_count')[:2]
    )
    
    serializer = StudentProfileSerializer(talents, many=True)
    return Response(serializer.data)



