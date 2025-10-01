import io
from django.urls import reverse
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

def test_upload_and_analysis(tmp_path, db):
    user = User.objects.create_user(username="test", password="pass")
    client = APIClient()
    # obtain token via login endpoint or set credentials depending on your auth
    client.force_authenticate(user=user)
    # create a small csv
    p = tmp_path / "data.csv"
    p.write_text("X, Y\n1,10\n2,20\n")
    with open(p, "rb") as f:
        resp = client.post("/api/uploads/", {"file": f}, format="multipart")
    assert resp.status_code == 201
    upload_id = resp.json()["id"]
    # create an analysis
    payload = {"upload": upload_id, "sheet_name": "sheet1", "x_column": "X", "y_column": " Y".strip(), "chart_type": "line"}
    ar = client.post("/api/analyses/", payload, format="json")
    assert ar.status_code == 201
    assert "result" in ar.json()
