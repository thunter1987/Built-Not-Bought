from contextlib import asynccontextmanager
from pathlib import Path
from app.api.auth import router as auth_router
from app.config import settings
from app.database import get_db
from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.api.cars import router as cars_router
from app.api.photos import router as photos_router
from app.api.modifications import router as modifications_router
from app.api.performance_logs import router as performance_logs_router
from app.api.analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    Path(settings.upload_dir).mkdir(
        parents=True,
        exist_ok=True,
    )
    yield


app = FastAPI(
    title="Built Not Bought API",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    auth_router,
    prefix="/api/v1",
)

app.include_router(
    cars_router,
    prefix="/api/v1",
)

app.include_router(
    photos_router,
    prefix="/api/v1",
)

app.include_router(
    modifications_router,
    prefix="/api/v1",
)

app.include_router(
    performance_logs_router,
    prefix="/api/v1",
)
app.include_router(
    analytics_router,
    prefix="/api/v1",
)
Path(settings.upload_dir).mkdir(
    parents=True,
    exist_ok=True,
)

app.mount(
    "/media",
    StaticFiles(directory=settings.upload_dir),
    name="media",
)


@app.get("/")
def root():
    return {
        "app": "Built Not Bought API",
        "status": "running",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
    }


@app.get("/health/db")
def health_db(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))

    return {
        "database": "ok",
    }
