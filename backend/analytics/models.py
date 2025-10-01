# backend/analytics/models.py
import os
import time
from django.db import models
from django.conf import settings

UserModel = settings.AUTH_USER_MODEL

def upload_path(instance, filename):
    """
    Return upload path used by migrations. Keep this stable so migrations can import it.
    Produces: uploads/<user_id>/<timestamp>_<filename>
    """
    # safe filename
    safe_name = filename.replace(" ", "_")
    # try to get user id (may not exist during migration, so fallback to 'anon')
    user_id = getattr(instance, "user_id", None) or (getattr(getattr(instance, "user", None), "id", None))
    if not user_id:
        user_part = "anon"
    else:
        user_part = str(user_id)
    ts = int(time.time())
    return os.path.join("uploads", user_part, f"{ts}_{safe_name}")

class Upload(models.Model):
    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name="uploads")
    # use the upload_path function so migration and model match
    file = models.FileField(upload_to=upload_path)
    original_name = models.CharField(max_length=512)
    filesize = models.PositiveBigIntegerField(null=True, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    processed = models.BooleanField(default=False)
    processing_error = models.TextField(null=True, blank=True)
    metadata = models.JSONField(null=True, blank=True, default=dict)

    class Meta:
        ordering = ["-uploaded_at"]

    def __str__(self):
        return f"{self.original_name} ({self.id})"

class Analysis(models.Model):
    CHOICES = [
        ("line", "Line"),
        ("bar", "Bar"),
        ("pie", "Pie"),
        ("scatter", "Scatter"),
    ]

    user = models.ForeignKey(UserModel, on_delete=models.CASCADE, related_name="analyses")
    upload = models.ForeignKey(Upload, on_delete=models.CASCADE, related_name="analyses")
    sheet_name = models.CharField(max_length=255)
    x_column = models.CharField(max_length=255)
    y_column = models.CharField(max_length=255)
    chart_type = models.CharField(max_length=32, choices=CHOICES, default="line")
    params = models.JSONField(null=True, blank=True)
    result = models.JSONField(null=True, blank=True)
    summary = models.JSONField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Analysis {self.pk} on upload {self.upload_id} ({self.chart_type})"
