# backend/analytics/views_analysis.py
import os
import pandas as pd
from rest_framework import viewsets, permissions
from .models import Analysis, Upload
from .serializers import AnalysisSerializer

class AnalysisViewSet(viewsets.ModelViewSet):
    queryset = Analysis.objects.all().order_by("-created_at")
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AnalysisSerializer

    def get_queryset(self):
        return Analysis.objects.filter(user=self.request.user).order_by("-created_at")

    def perform_create(self, serializer):
        # Save object (user set here)
        instance = serializer.save(user=self.request.user)

        try:
            upload = instance.upload
            path = upload.file.path
            _, ext = os.path.splitext(path.lower())

            # load sheet (sheet_name expected to be a sheet name string)
            if ext in (".xlsx", ".xls"):
                # read specified sheet
                df = pd.read_excel(path, sheet_name=instance.sheet_name)
                # ensure DataFrame
                if not hasattr(df, "columns"):
                    # if read_excel returned dict (shouldn't for single sheet) pick first
                    if isinstance(df, dict):
                        df = list(df.values())[0]
            else:
                df = pd.read_csv(path)

            # verify columns exist
            if instance.x_column not in df.columns or instance.y_column not in df.columns:
                raise ValueError("Selected columns not found in sheet")

            # Build chart-ready payload
            if instance.chart_type in ("line", "bar", "scatter"):
                labels = df[instance.x_column].astype(str).tolist()
                yvals = pd.to_numeric(df[instance.y_column], errors="coerce").fillna(0).tolist()
                result = {"labels": labels, "datasets": [{"label": instance.y_column, "data": yvals}]}
                try:
                    s = pd.Series(yvals)
                    summary = {"count": int(s.count()), "mean": float(s.mean()), "min": float(s.min()), "max": float(s.max())}
                except Exception:
                    summary = {}
            elif instance.chart_type == "pie":
                grouped = df.groupby(instance.x_column)[instance.y_column].sum()
                labels = grouped.index.astype(str).tolist()
                data = grouped.tolist()
                result = {"labels": labels, "datasets": [{"label": instance.y_column, "data": data}]}
                summary = {"categories": len(labels)}
            else:
                result = {"labels": [], "datasets": []}
                summary = {}

            instance.result = result
            instance.summary = summary
            instance.save()

        except Exception as e:
            # Save error in result so frontend sees it
            instance.result = {"error": str(e)}
            instance.save()
