from rest_framework import serializers

from .models import (
    Endorsement,
    Experience,
    PortfolioProject,
    Skill,
    SocialLink,
    StudentProfile,
    StudentSkill,
)


class SkillSerializer(serializers.ModelSerializer):
    class Meta:
        model = Skill
        fields = ["id", "name"]


class StudentSkillSerializer(serializers.ModelSerializer):
    skill = SkillSerializer()

    class Meta:
        model = StudentSkill
        fields = ["id", "skill", "level", "endorsement_count"]


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ["id", "title", "company", "start_date", "end_date", "description"]


class PortfolioProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = PortfolioProject
        fields = ["id", "title", "description", "link_demo", "link_repo"]


class SocialLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialLink
        fields = ["id", "platform", "label", "url_or_handle"]


class StudentProfileSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)
    skills = StudentSkillSerializer(source="student_skills", many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)
    projects = PortfolioProjectSerializer(many=True, read_only=True)
    social_links = SocialLinkSerializer(many=True, read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            "id",
            "user_full_name",
            "email",
            "nim",
            "prodi",
            "angkatan",
            "headline",
            "bio",
            "photo",
            "is_public",
            "is_active",
            "views_count",
            "created_at",
            "updated_at",
            "skills",
            "experiences",
            "projects",
            "social_links",
        ]
        read_only_fields = ["views_count", "created_at", "updated_at", "is_active"]


class StudentProfileUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentProfile
        fields = [
            "headline",
            "bio",
            "photo",
            "prodi",
            "angkatan",
            "is_public",
        ]


class EndorsementSerializer(serializers.ModelSerializer):
    endorser = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Endorsement
        fields = ["id", "endorser", "message", "created_at"]



