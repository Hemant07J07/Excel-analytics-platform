# backend/analytics/views.py
import os
import pandas as pd
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.utils.decorators import method_decorator
from django.contrib.auth import get_user_model
from .models import Upload

User = get_user_model()

ALLOWED_EXTENSIONS = {".xlsx", ".xls", ".csv"}

def _ext_allowed(name: str) -> bool:
    _, ext = os.path.splitext(name.lower())
    return ext in ALLOWED_EXTENSIONS

def _parse_file_metadata(path: str, max_preview_rows: int = 5):
    metadata = {}
    _, ext = os.path.splitext(path.lower())
    if ext in [".xlsx", ".xls"]:
        xls = pd.read_excel(path, sheet_name=None)
        for sheet_name, df in xls.items():
            cols = list(map(str, df.columns.tolist()))
            preview = df.head(max_preview_rows).fillna("").to_dict(orient="records")
            metadata[str(sheet_name)] = {"columns": cols, "preview": preview}
    elif ext == ".csv":
        df = pd.read_csv(path)
        cols = list(map(str, df.columns.tolist()))
        preview = df.head(max_preview_rows).fillna("").to_dict(orient="records")
        metadata["sheet1"] = {"columns": cols, "preview": preview}
    return metadata

def json_ok(data, status=200):
    return JsonResponse(data, status=status, safe=False)

@method_decorator(csrf_exempt, name="dispatch")
class UploadListView(View):
    def post(self, request):
        print("=== UploadListView POST called ===")
        print("path:", request.path, "host:", request.get_host())
        for k in ("authorization", "content-type"):
            print(k, "=", request.headers.get(k))
        print("FILES keys:", list(request.FILES.keys()))

        # Choose a user — prefer authenticated user else first user (dev fallback)
        try:
            user = request.user if request.user and request.user.is_authenticated else User.objects.first()
        except Exception:
            user = User.objects.first()

        f = request.FILES.get("file")
        if f is None:
            return json_ok({"error": "file field missing"}, status=400)

        if not _ext_allowed(f.name):
            return json_ok({"error": "invalid extension"}, status=400)

        upload = Upload.objects.create(user=user, file=f, original_name=f.name, filesize=f.size)
        try:
            path = upload.file.path
            metadata = _parse_file_metadata(path)
            upload.metadata = metadata
            upload.processed = True
            upload.processing_error = None
            upload.save()
        except Exception as e:
            upload.processed = False
            upload.processing_error = str(e)
            upload.save()

        data = {
            "id": upload.id,
            "original_name": upload.original_name,
            "processed": upload.processed,
            "metadata": upload.metadata,
            "uploaded_at": upload.uploaded_at.isoformat(),
        }
        return json_ok(data, status=201)

    def get(self, request):
        qs = Upload.objects.all().order_by("-uploaded_at")[:20]
        data = [
            {"id": u.id, "original_name": u.original_name, "processed": u.processed, "uploaded_at": u.uploaded_at.isoformat()}
            for u in qs
        ]
        return json_ok(data)

@method_decorator(csrf_exempt, name="dispatch")
class UploadDetailView(View):
    def get(self, request, pk):
        try:
            u = Upload.objects.get(pk=pk)
        except Upload.DoesNotExist:
            return json_ok({"detail": "Not found."}, status=404)
        data = {
            "id": u.id,
            "original_name": u.original_name,
            "processed": u.processed,
            "metadata": u.metadata,
            "uploaded_at": u.uploaded_at.isoformat(),
        }
        return json_ok(data)

    def delete(self, request, pk):
        try:
            u = Upload.objects.get(pk=pk)
        except Upload.DoesNotExist:
            return json_ok({"detail": "Not found."}, status=404)
        u.delete()
        return json_ok({"status": "deleted"})

upload_list_view = UploadListView.as_view()
upload_detail_view = UploadDetailView.as_view()
reparse_view = lambda request, pk: json_ok({"status": "not implemented"}, status=501)
