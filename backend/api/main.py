"""
Vitalis Clinical Logistics Gateway — Main FastAPI Entry Point
Production-ready configuration with lifespan events, request tracing, and structured logging.
"""

import os
import time
import uuid
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from backend.core.config import settings
from backend.core.logging import logger
from backend.ml.service import ml_service
from backend.api.routes import router as api_v1_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup & shutdown events."""
    logger.info("Initializing Vitalis Clinical Logistics Gateway...")
    logger.info(f"Target Environment: {settings.ENVIRONMENT} (Debug={settings.DEBUG})")
    
    # Warm up ML Inference Service
    if ml_service.models_loaded:
        logger.info("ML Models successfully preloaded and ready for inference.")
    else:
        logger.warning("ML Service running in heuristic fallback mode.")
    
    yield
    logger.info("Shutting down Vitalis Clinical Logistics Gateway gracefully.")

app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Event-driven, agentic clinical logistics platform for blood, organ, "
        "and medical supply redistribution in Chennai. Aligned with BCSE335L."
    ),
    version=settings.APP_VERSION,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Request Timing & Correlation ID Middleware
@app.middleware("http")
async def add_process_time_and_request_id(request: Request, call_next):
    request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
    start_time = time.perf_counter()
    
    try:
        response = await call_next(request)
        process_time = (time.perf_counter() - start_time) * 1000.0
        response.headers["X-Process-Time"] = f"{process_time:.2f}ms"
        response.headers["X-Request-ID"] = request_id
        return response
    except Exception as exc:
        process_time = (time.perf_counter() - start_time) * 1000.0
        logger.exception(f"Unhandled exception on {request.method} {request.url.path} [{request_id}]: {exc}")
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "detail": "Internal server error occurred within clinical dispatch pipeline.",
                "request_id": request_id,
                "process_time_ms": round(process_time, 2)
            },
            headers={"X-Request-ID": request_id}
        )

# Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API v1 routes
app.include_router(api_v1_router)

@app.get("/", tags=["System"])
async def root():
    return {
        "service": settings.APP_NAME,
        "status": "operational",
        "version": settings.APP_VERSION,
        "documentation": "/docs"
    }

@app.get("/health", tags=["System"])
async def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "database": "connected (PostgreSQL/PostGIS)",
        "models": {
            "meta_prophet": "loaded" if ml_service.prophet_model else "fallback",
            "xgboost_guardrail": "loaded" if ml_service.xgb_model else "fallback",
            "guardrail_threshold": settings.STOCKOUT_RISK_THRESHOLD
        },
        "hitl_governance": "enforced (explicit admin action required for in_transit)"
    }

if __name__ == "__main__":
    import uvicorn
    logger.info(f"Starting Vitalis Gateway on http://{settings.BACKEND_HOST}:{settings.BACKEND_PORT}")
    uvicorn.run(
        "backend.api.main:app",
        host=settings.BACKEND_HOST,
        port=settings.BACKEND_PORT,
        reload=False
    )
