import uuid
from pathlib import Path
from uuid import UUID
from fastapi import APIRouter, Depends, File, HTTPException, Response, UploadFile, status
from sqlalchemy import select
from sqlalchemy.orm import Session
from app.api.cars import get_owned_car_or_404
from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import CarPhoto, User
from app.schemas import CarPhotoOut

router = APIRouter(
    tags=["photos"],
)

ALLOWED_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif"
}

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
}

def validate_image_file(file: UploadFile) -> str:
    filename = file.filename or ""
    extension = Path(filename).suffix.lower()
    
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only JPG, JPEG, PNG, WEBP, and GIF images are allowed",
        )
        if file.content_type not in ALLOWED_CONTENT_TYPES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image content type",
            )
            
            return extension
        async def read_file_with_size_limit(
            file: UploadFile
            )
