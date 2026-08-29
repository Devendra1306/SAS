from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import contextlib
import logging

from app.config import settings
from app.database.mongodb import connect_to_mongo, close_mongo_connection
from app.database.collections import create_indexes
from app.api import api_router
from app.api.websocket import router as ws_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s"
)
logger = logging.getLogger(__name__)


@contextlib.asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown."""
    logger.info("Starting SAS Backend...")

    # Connect MongoDB with graceful fallback
    try:
        await connect_to_mongo()
        try:
            await create_indexes()
            logger.info("MongoDB indexes verified")
        except Exception as ie:
            logger.warning(f"Index creation notice: {ie}")
    except Exception as me:
        logger.error(f"MongoDB connection error: {me}")

    # Init Pinecone
    try:
        from app.vector_db.pinecone_service import pinecone_service
        if pinecone_service.is_available:
            logger.info("Pinecone connected")
        else:
            logger.warning("Pinecone unavailable — face recognition disabled")
    except Exception as e:
        logger.warning(f"Pinecone init error: {e}")

    # Warm up AI pipeline
    try:
        from app.ai.pipeline import get_pipeline
        pipeline = get_pipeline()
        logger.info(f"AI Pipeline ready | Detector: {'ready' if pipeline.detector.is_available else 'demo mode'}")
    except Exception as e:
        logger.warning(f"AI Pipeline init error: {e}")

    yield

    logger.info("Shutting down SAS Backend...")
    try:
        await close_mongo_connection()
    except Exception:
        pass


app = FastAPI(
    title="Student Attendance System (SAS)",
    description="AI-powered face recognition attendance system",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Routers
app.include_router(api_router, prefix="/api")
app.include_router(ws_router)  # WebSocket at /ws/attendance/{session_id}


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "version": "1.0.0",
        "mode": settings.APP_MODE
    }
