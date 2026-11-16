import sys
import os
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
import httpx

# Ensure repository root is on sys.path
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.dirname(CURRENT_DIR)
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

# Check for Vercel service binding for internal backend service
backend_url = os.environ.get("BACKEND_URL") or os.environ.get("BACKEND_SERVICE_URL")

if backend_url:
    # Service Gateway mode: Reverse proxy incoming /api/* calls to internal 'backend' service
    app = FastAPI(
        title="JALASHAYA API Gateway",
        description="Public API Gateway routing to internal backend microservice"
    )

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    client = httpx.AsyncClient(base_url=backend_url.rstrip("/"), timeout=60.0)

    @app.api_route("/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "OPTIONS"])
    async def gateway_proxy(request: Request, path: str):
        url = httpx.URL(path=request.url.path, query=request.url.query.encode("utf-8"))
        headers = dict(request.headers)
        headers.pop("host", None)
        body = await request.body()

        backend_response = await client.request(
            method=request.method,
            url=url,
            headers=headers,
            content=body
        )

        return Response(
            content=backend_response.content,
            status_code=backend_response.status_code,
            headers=dict(backend_response.headers)
        )
else:
    # Direct service mode: Run FastAPI application in-process
    from backend.app.main import app
