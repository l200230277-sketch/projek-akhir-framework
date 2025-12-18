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
    # Read-only nested skill data for output
    skill = SkillSerializer(read_only=True)
    # Write-only input used by MySkillViewSet.perform_create
    skill_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = StudentSkill
        fields = ["id", "skill", "skill_name", "level", "endorsement_count"]


class ExperienceSerializer(serializers.ModelSerializer):
    def validate_start_date(self, value):
        from django.utils import timezone
        if value > timezone.now().date():
            raise serializers.ValidationError("Tanggal mulai tidak boleh lebih dari tanggal hari ini.")
        return value

    def validate_end_date(self, value):
        from django.utils import timezone
        from django.utils.dateparse import parse_date
        if value:
            if value > timezone.now().date():
                raise serializers.ValidationError("Tanggal selesai tidak boleh lebih dari tanggal hari ini.")
            # Check against start_date from initial_data or instance
            start_date_str = self.initial_data.get('start_date')
            if start_date_str:
                start_date = parse_date(start_date_str) if isinstance(start_date_str, str) else start_date_str
                if start_date and value < start_date:
                    raise serializers.ValidationError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.")
            elif self.instance and self.instance.start_date:
                if value < self.instance.start_date:
                    raise serializers.ValidationError("Tanggal selesai tidak boleh lebih awal dari tanggal mulai.")
        return value

    def validate(self, data):
        from django.utils import timezone
        start_date = data.get('start_date') or (self.instance.start_date if self.instance else None)
        end_date = data.get('end_date')
        
        if start_date and start_date > timezone.now().date():
            raise serializers.ValidationError({"start_date": "Tanggal mulai tidak boleh lebih dari tanggal hari ini."})
        
        if end_date and start_date and end_date < start_date:
            raise serializers.ValidationError({"end_date": "Tanggal selesai tidak boleh lebih awal dari tanggal mulai."})
        
        return data

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
    user_full_name = serializers.CharField(source="user.full_name", required=False, allow_blank=True)
    
    def validate_prodi(self, value):
        import re
        if value and not re.match(r'^[a-zA-Z\s\.\,\-\(\)]+$', value):
            raise serializers.ValidationError("Program studi hanya boleh berisi huruf, spasi, dan tanda baca.")
        return value.strip() if value else value
    
    def validate_angkatan(self, value):
        if value and len(value) != 4:
            raise serializers.ValidationError("Angkatan harus 4 digit.")
        if value and not value.isdigit():
            raise serializers.ValidationError("Angkatan hanya boleh berisi angka.")
        return value
    
    def validate_user_full_name(self, value):
        import re
        if value and not re.match(r'^[a-zA-Z\s\.\,\-\']+$', value):
            raise serializers.ValidationError("Nama hanya boleh berisi huruf, spasi, titik, koma, tanda hubung, dan apostrof.")
        return value.strip() if value else value
    
    def update(self, instance, validated_data):
        # Handle user full_name update
        user_data = validated_data.pop('user', {})
        if 'full_name' in user_data:
            instance.user.full_name = user_data['full_name']
            instance.user.save()
        return super().update(instance, validated_data)

    class Meta:
        model = StudentProfile
        fields = [
            "user_full_name",
            "photo",
            "prodi",
            "angkatan",
        ]


class EndorsementSerializer(serializers.ModelSerializer):
    endorser = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Endorsement
        fields = ["id", "endorser", "message", "created_at"]



