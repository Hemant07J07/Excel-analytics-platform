# backend/analytics/admin.py
from django.contrib import admin
from .models import Upload, Analysis

@admin.register(Upload)
class UploadAdmin(admin.ModelAdmin):
    list_display = ("id", "original_name", "user", "uploaded_at", "processed", "filesize")
    readonly_fields = ("uploaded_at",)
    search_fields = ("original_name", "user__username")
    list_filter = ("processed",)

@admin.register(Analysis)
class AnalysisAdmin(admin.ModelAdmin):
    list_display = ("id", "upload", "user", "chart_type", "created_at")
    readonly_fields = ("created_at",)
    search_fields = ("upload__original_name", "user__username")
