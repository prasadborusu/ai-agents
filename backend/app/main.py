import os
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.core.logging import logger
from app.seed.seed_data import seed_database

# Routers
from app.api.routes.machines import router as machines_router
from app.api.routes.incidents import router as incidents_router
from app.api.routes.diagnosis import router as diagnosis_router
from app.api.routes.memory import router as memory_router
from app.api.routes.insights import router as insights_router
from app.api.routes.health import router as health_router
from app.api.routes.settings import router as settings_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables exist and seed database
    logger.info(f"Initializing {settings.PROJECT_NAME} backend...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database relational schema verified.")

    # Run seed data
    async with AsyncSessionLocal() as session:
        try:
            await seed_database(session)
        except Exception as e:
            logger.error(f"Seed initialization error: {e}", exc_info=True)

    yield

    # Shutdown
    await engine.dispose()
    logger.info("Database connection closed gracefully.")

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Every repair becomes knowledge. AI-powered industrial maintenance and field-service troubleshooting with persistent Hindsight memory.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration - permissive for cross-origin frontend hosting (e.g. Vercel)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r"https://.*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Structured Observability Middleware
@app.middleware("http")
async def observability_middleware(request: Request, call_next):
    req_id = str(uuid.uuid4())[:8]
    start_time = time.perf_counter()
    request.state.request_id = req_id

    try:
        response = await call_next(request)
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        response.headers["X-Request-ID"] = req_id
        response.headers["X-Response-Time"] = f"{duration_ms}ms"

        # Suppress noisy health checks from clogging standard logs
        if not request.url.path.endswith("/health"):
            logger.info(
                f"{request.method} {request.url.path} -> {response.status_code} ({duration_ms}ms)",
                extra={"request_id": req_id, "response_time_ms": duration_ms}
            )
        return response
    except Exception as exc:
        duration_ms = round((time.perf_counter() - start_time) * 1000, 2)
        logger.error(
            f"Unhandled exception during {request.method} {request.url.path}: {exc}",
            exc_info=True,
            extra={"request_id": req_id, "response_time_ms": duration_ms}
        )
        return JSONResponse(
            status_code=500,
            content={
                "error": "Internal Server Error",
                "message": "The system encountered an unexpected error. Incident data is safe.",
                "request_id": req_id
            }
        )

# Register API Routers
app.include_router(machines_router, prefix=settings.API_V1_STR)
app.include_router(incidents_router, prefix=settings.API_V1_STR)
app.include_router(diagnosis_router, prefix=settings.API_V1_STR)
app.include_router(memory_router, prefix=settings.API_V1_STR)
app.include_router(insights_router, prefix=settings.API_V1_STR)
app.include_router(health_router, prefix=settings.API_V1_STR)
app.include_router(settings_router, prefix=settings.API_V1_STR)

# Check for compiled frontend distribution in multiple possible locations
dist_candidates = [
    os.path.join(os.path.dirname(__file__), "../static"),
    os.path.join(os.path.dirname(__file__), "../../../frontend/dist"),
    os.path.join(os.getcwd(), "frontend/dist"),
    os.path.join(os.getcwd(), "backend/static"),
    os.path.join(os.getcwd(), "static"),
]
dist_dir = None
for candidate in dist_candidates:
    normalized = os.path.abspath(candidate)
    if os.path.exists(normalized) and os.path.isfile(os.path.join(normalized, "index.html")):
        dist_dir = normalized
        break

if dist_dir:
    logger.info(f"Serving static frontend UI from {dist_dir}")
    assets_dir = os.path.join(dist_dir, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        # Don't intercept API paths or OpenAPI docs
        if full_path.startswith("api") or full_path in ("docs", "redoc", "openapi.json"):
            return JSONResponse(status_code=404, content={"detail": "Not Found"})
        # Check if requesting a direct static asset file (e.g. favicon.svg, icons.svg)
        potential_file = os.path.join(dist_dir, full_path)
        if full_path and os.path.isfile(potential_file):
            return FileResponse(potential_file)
        # Fallback to SPA index.html for client-side routing
        return FileResponse(os.path.join(dist_dir, "index.html"))
else:
    @app.get("/")
    async def root():
        return {
            "service": settings.PROJECT_NAME,
            "tagline": settings.TAGLINE,
            "status": "operational",
            "docs": "/docs"
        }
