from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app import models  # noqa: F401
from app.config import settings
from app.database import Base, engine, get_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
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
