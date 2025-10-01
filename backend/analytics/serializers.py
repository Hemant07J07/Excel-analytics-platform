# backend/analytics/serializers.py
from rest_framework import serializers
from .models import Upload, Analysis

class UploadListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Upload
        fields = ["id", "original_name", "uploaded_at", "processed", "metadata", "filesize"]

class UploadDetailSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Upload
        fields = ["id", "user", "original_name", "file", "file_url", "uploaded_at", "processed", "processing_error", "metadata", "filesize"]
        read_only_fields = ["id","user","uploaded_at","processed","metadata","processing_error","filesize"]
    
    def get_file_url(self, obj):
        try:
            request = self.context.get("request")
            if obj.file and request:
                return request.build_absolute_uri(obj.file.url)
            elif obj.file:
                return obj.file.url
        except Exception:
            return None
        return None

class AnalysisSerializer(serializers.ModelSerializer):
    # include nested upload id (read as integer) and read-only result/summary
    class Meta:
        model = Analysis
        fields = ["id", "user", "upload", "sheet_name", "x_column", "y_column", "chart_type", "params", "result", "summary", "created_at"]
        read_only_fields = ["id", "user", "result", "summary", "created_at"]
