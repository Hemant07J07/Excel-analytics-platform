# backend/analytics/urls.py
from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import upload_list_view, upload_detail_view, reparse_view
from .views_analysis import AnalysisViewSet

router = DefaultRouter()
router.register(r"analyses", AnalysisViewSet, basename="analysis")

urlpatterns = [
    path("uploads/", upload_list_view, name="upload-list"),
    path("uploads/<int:pk>/", upload_detail_view, name="upload-detail"),
    path("uploads/<int:pk>/reparse/", reparse_view, name="upload-reparse"),
    path("", include(router.urls)),
]
