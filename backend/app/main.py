import uuid
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.logging import setup_logging
from app.core.exceptions import (
    FlightGuardException,
    flightguard_exception_handler,
    global_exception_handler
)
from app.api.v1.api import api_router

setup_logging()

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# Request ID Middleware
@app.middleware("http")
async def add_request_id_header(request: Request, call_next):
    request_id = str(uuid.uuid4())[:8]
    request.state.request_id = request_id
    response = await call_next(request)
    response.headers["X-Request-ID"] = request_id
    return response

# CORS Configuration
if settings.CORS_ORIGINS:
    cors_origins = [str(origin) for origin in settings.CORS_ORIGINS] if settings.CORS_ORIGINS != "*" else ["*"]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_origin_regex=r"https://.*\.vercel\.app",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Startup Event: Ensure database tables are created and seeded
@app.on_event("startup")
def on_startup():
    import sys
    if "pytest" in sys.modules or settings.APP_ENV == "test":
        return
    try:
        import app.db.base
        from app.db.session import engine, SessionLocal
        from app.db.seed import seed_database
        app.db.base.Base.metadata.create_all(bind=engine)
        db = SessionLocal()
        try:
            seed_database(db)
        finally:
            db.close()
        print("[Startup] Database tables initialized and seed verified.")
    except Exception as e:
        print(f"[Startup Warning] Database initialization: {e}")

# Exception Handlers
app.add_exception_handler(FlightGuardException, flightguard_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# API v1 Router (Primary)
app.include_router(api_router, prefix=settings.API_V1_STR)
# API Router Fallback (also mounted at root for maximum client compatibility)
app.include_router(api_router)


@app.get("/")
def root_endpoint():
    return {
        "name": settings.PROJECT_NAME,
        "docs": f"{settings.API_V1_STR}/docs",
        "status": "online"
    }


@app.get("/docs", include_in_schema=False)
def docs_redirect():
    from fastapi.responses import RedirectResponse
    return RedirectResponse(url=f"{settings.API_V1_STR}/docs")

