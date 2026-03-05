# Excel Analytics

Upload Excel/CSV files, inspect detected columns/previews, and generate chart-ready analysis results via a Django REST API with a React (Vite) frontend.

## Project Structure

- `backend/` — Django + DRF API (SQLite, JWT auth)
- `frontend/` — React + Vite UI (Tailwind)

## Tech Stack

- Backend: Django, Django REST Framework, `djangorestframework-simplejwt`, pandas, openpyxl
- Frontend: React, React Router, Axios, Tailwind CSS, Chart.js (via `react-chartjs-2`)

## Local Development (Windows)

### 1) Backend (Django)

From the repo root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 8000
```

Backend will be available at:

- API: `http://127.0.0.1:8000/api/`
- Admin: `http://127.0.0.1:8000/admin/`

Uploads are stored under `backend/media/uploads/` in dev.

### 2) Frontend (Vite)

In a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173`.

## Authentication (JWT)

The backend is configured for JWT auth for DRF views.

### Register

`POST /api/auth/register/`

Body:

```json
{ "username": "alice", "email": "alice@example.com", "password": "password123" }
```

### Login (Token)

`POST /api/auth/token/`

Body:

```json
{ "username": "alice", "password": "password123" }
```

Response includes `access` and `refresh`. Use the access token as:

`Authorization: Bearer <access>`

### Refresh

`POST /api/auth/token/refresh/`

Body:

```json
{ "refresh": "..." }
```

## API Overview

Base prefix: `/api/`

### Uploads

Routes are defined in `backend/analytics/urls.py`.

- `GET /api/uploads/` — list recent uploads (currently returns up to 20)
- `POST /api/uploads/` — upload a file (`multipart/form-data`, field name: `file`)
- `GET /api/uploads/<id>/` — upload details including detected metadata
- `DELETE /api/uploads/<id>/` — delete an upload
- `POST /api/uploads/<id>/reparse/` — currently returns `501 Not Implemented`

Supported file extensions: `.xlsx`, `.xls`, `.csv`.

**Metadata shape** (stored on the `Upload.metadata` JSON field):

- Excel: one entry per sheet name
- CSV: stored under the key `"sheet1"`

Example:

```json
{
  "sheet1": {
    "columns": ["X", "Y"],
    "preview": [{"X": 1, "Y": 10}, {"X": 2, "Y": 20}]
  }
}
```

### Analyses

Analyses are a DRF `ModelViewSet` at:

- `GET /api/analyses/` — list analyses for the current user
- `POST /api/analyses/` — create an analysis (computes `result` + `summary`)
- `GET /api/analyses/<id>/` — retrieve
- `PATCH/PUT /api/analyses/<id>/` — update
- `DELETE /api/analyses/<id>/` — delete

Create payload example:

```json
{
  "upload": 1,
  "sheet_name": "sheet1",
  "x_column": "X",
  "y_column": "Y",
  "chart_type": "line"
}
```

`chart_type` supports: `line`, `bar`, `pie`, `scatter`.

**Result shape** (chart-ready):

- Line/Bar/Scatter: `{ labels: string[], datasets: [{ label: string, data: number[] }] }`
- Pie: data is grouped by `x_column` and summed over `y_column`

## Frontend Pages

Routes are defined in `frontend/src/App.jsx`.

- `/login` — obtains JWT access token and stores it in `localStorage`
- `/signup` — user registration
- `/dashboard` — shows recent uploads (calls `GET /api/uploads/`)
- `/upload` — file upload + polling until processed
- `/uploads/:id` — shows upload metadata + a “Create Analysis” form (currently a stub)

The API base is hard-coded in:

- `frontend/src/api.js` (`http://127.0.0.1:8000/api`)
- `frontend/src/pages/UploadDetail.jsx` (also hard-coded)

## Notes / Current Limitations

Based on the current code:

- Upload endpoints (`/api/uploads/*`) are implemented as plain Django `View`s (CSRF-exempt) and do **not** apply DRF JWT permissions by default.
  - They also do not filter by owner on read/delete.
  - Analyses endpoints (`/api/analyses/*`) *do* require JWT auth and are user-scoped.
- The frontend “Create Analysis” flow in `UploadDetail` currently only shows an alert; it does not POST to `/api/analyses/` yet.
- `frontend/src/pages/Analyses.jsx` exists but is not wired into `App.jsx` routing.
- `MAX_UPLOAD_SIZE` is defined in `backend/config/settings.py` but is not currently enforced in the upload view.

## Running Backend Tests (Optional)

There is a pytest-style test at `backend/analytics/tests/test_api.py`, but `pytest`/`pytest-django` are not listed in `backend/requirements.txt`.

If you want to run it, install dev dependencies (example):

```powershell
cd backend
pip install pytest pytest-django
pytest
```
