import uuid
from pathlib import Path
from uuid import UUID
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Response,
    UploadFile,
    status,
)
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

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}

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
    file: UploadFile,
    max_bytes: int,
) -> bytes:
    total_size = 0
    chunks: list[bytes] = []

    while True:
        chunk = await file.read(1024 * 1024)

        if not chunk:
            break

        total_size += len(chunk)

        if total_size > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_CONTENT_TOO_LARGE,
                detail="File is too large. Maximum size is {settings.max_upload_size_mb} MB",
            )

        chunks.append(chunk)
    return b"".join(chunks)


@router.post(
    "/cars/{car_id}/photos",
    response_model=CarPhotoOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_car_photo(
    car_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(
        car_id=car_id,
        user_id=current_user.id,
        db=db,
    )

    extension = validate_image_file(file)

    content = await read_file_with_size_limit(
        file=file,
        max_bytes=settings.max_upload_size_bytes,
    )

    car_photo_directory = Path(settings.upload_dir) / "cars" / str(car.id)

    car_photo_directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    stored_name = f"{uuid.uuid4()}{extension}"

    storage_path = car_photo_directory / stored_name

    storage_path.write_bytes(content)

    url_path = f"/media/cars/{car.id}/{stored_name}"

    photo = CarPhoto(
        car_id=car.id,
        original_filename=file.filename or stored_name,
        storage_path=str(storage_path),
        url_path=url_path,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=len(content),
    )

    db.add(photo)
    db.commit()
    db.refresh(photo)

    return photo


@router.get(
    "/cars/{car_id}/photos",
    response_model=list[CarPhotoOut],
)
def list_car_photos(
    car_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(
        car_id=car_id,
        user_id=current_user.id,
        db=db,
    )

    statement = (
        select(CarPhoto).where(CarPhoto.car_id == car.id).order_by(CarPhoto.created_at)
    )

    return db.scalars(statement).all()


@router.delete(
    "/cars/{car_id}/photos/{photo_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_car_photo(
    car_id: UUID,
    photo_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(
        car_id=car_id,
        user_id=current_user.id,
        db=db,
    )

    photo = db.scalar(
        select(CarPhoto).where(
            CarPhoto.id == photo_id,
            CarPhoto.car_id == car_id,
        )
    )

    if photo is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Photo not found",
        )

    db.delete(photo)
    db.commit()

    Path(photo.storage_path).unlink(missing_ok=True)

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
