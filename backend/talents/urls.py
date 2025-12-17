from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    AdminTalentViewSet,
    LatestTalentListView,
    MyExperienceViewSet,
    MyProfileView,
    MyProjectViewSet,
    MySkillViewSet,
    MySocialLinkViewSet,
    PublicTalentListView,
    TalentDetailView,
)

router = DefaultRouter()
router.register(r"me/skills", MySkillViewSet, basename="my-skills")
router.register(r"me/experiences", MyExperienceViewSet, basename="my-experiences")
router.register(r"me/projects", MyProjectViewSet, basename="my-projects")
router.register(r"me/social-links", MySocialLinkViewSet, basename="my-social-links")
router.register(r"admin/talents", AdminTalentViewSet, basename="admin-talents")

urlpatterns = [
    path("me/profile/", MyProfileView.as_view(), name="my-profile"),
    path("public/", PublicTalentListView.as_view(), name="public-talents"),
    path("latest/", LatestTalentListView.as_view(), name="latest-talents"),
    path("<int:pk>/", TalentDetailView.as_view(), name="talent-detail"),
    path("", include(router.urls)),
]



