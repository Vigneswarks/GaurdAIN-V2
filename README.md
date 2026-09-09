# GuardAIN V2

GuardAIN is a privacy-preserving fraud triage project with:

- a FastAPI backend with deterministic heuristic fallback detection;
- a PWA triage console;
- an administrator incident portal;
- an optional Chrome Manifest V3 extension; and
- optional Redis, PostgreSQL, and ONNX model integrations.

## Quick start

From the project root, run the following in PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
python -m pip install -r backend\requirements.txt
python run_all.py
```

If no virtual environment exists, create one first:

```powershell
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Open these URLs after startup:

- PWA: <http://127.0.0.1:3000>
- Admin portal: <http://127.0.0.1:3001>
- API health: <http://127.0.0.1:8080/health>
- API docs: <http://127.0.0.1:8080/docs>

The launcher starts the API and both static consoles. Press `Ctrl+C` to stop
all three processes.

## Development authentication

The admin portal uses `POST /v1/admin/login` and JWT bearer tokens.

- Username: `admin`
- Password: `guardain-local-admin`

These are development defaults only. Before sharing or deploying the project,
set `GUARDAIN_ADMIN_PASSWORD` and `JWT_SECRET_KEY` to strong secret values.
Do not commit `.env` files or credentials.

The public `POST /v1/verify` endpoint does not require a token. Protected
model/graph endpoints require both a bearer token from `POST /v1/token` and an
`X-API-Key` header.

## Docker

Docker Compose starts Redis, PostgreSQL, and the API:

```powershell
$env:JWT_SECRET_KEY = "replace-with-a-long-random-secret"
$env:GUARDAIN_ADMIN_PASSWORD = "replace-with-a-strong-admin-password"
$env:DATABASE_URL = "postgresql://guardain:guardain@postgres:5432/guardain"
docker compose up --build
```

The container API is available at <http://127.0.0.1:8080>. See
[HOW_TO_RUN.md](HOW_TO_RUN.md) for health checks, authentication examples,
troubleshooting, and extension setup.

## Optional model export

The default local mode uses `heuristic-fallback-v1`, so model export is not
required:

```powershell
python ai_pipeline\export_onnx.py
python run_all.py --export-model
```

The export downloads model assets and may require substantial disk space and
network access.
