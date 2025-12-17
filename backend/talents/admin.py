from django.contrib import admin

from .models import (
    Endorsement,
    Experience,
    PortfolioProject,
    Skill,
    SocialLink,
    StudentProfile,
    StudentSkill,
    ProfileView,
)


@admin.register(StudentProfile)
class StudentProfileAdmin(admin.ModelAdmin):
    list_display = ("nim", "user", "prodi", "angkatan", "is_public", "is_active")
    search_fields = ("nim", "user__full_name", "user__email", "prodi")
    list_filter = ("prodi", "angkatan", "is_public", "is_active")


@admin.register(Skill)
class SkillAdmin(admin.ModelAdmin):
    search_fields = ("name",)


@admin.register(StudentSkill)
class StudentSkillAdmin(admin.ModelAdmin):
    list_display = ("student", "skill", "level", "endorsement_count")
    search_fields = ("student__nim", "skill__name")


@admin.register(Experience)
class ExperienceAdmin(admin.ModelAdmin):
    list_display = ("student", "title", "company", "start_date", "end_date")


@admin.register(PortfolioProject)
class PortfolioProjectAdmin(admin.ModelAdmin):
    list_display = ("student", "title")


@admin.register(SocialLink)
class SocialLinkAdmin(admin.ModelAdmin):
    list_display = ("student", "platform", "url_or_handle")


@admin.register(ProfileView)
class ProfileViewAdmin(admin.ModelAdmin):
    list_display = ("student", "viewer_ip", "viewed_at")


@admin.register(Endorsement)
class EndorsementAdmin(admin.ModelAdmin):
    list_display = ("endorsed_skill", "endorser", "created_at")



