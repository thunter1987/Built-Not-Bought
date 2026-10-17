import shutil
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
from sqlalchemy.orm import Session, selectinload

from app.api.cars import get_owned_car_or_404
from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import PerformanceLog, PerformanceLogPhoto, User
from app.schemas import (
    PerformanceLogCreate,
    PerformanceLogOut,
    PerformanceLogPhotoOut,
    PerformanceLogUpdate,
)

router = APIRouter(
    prefix="/cars/{car_id}/logs",
    tags=["performance-logs"],
)


ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
ALLOWED_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}


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


async def read_file_with_size_limit(file: UploadFile, max_bytes: int) -> bytes:
    total_size = 0
    chunks: list[bytes] = []

    while True:
        chunk = await file.read(1024 * 1024)

        if not chunk:
            break

        total_size += len(chunk)

        if total_size > max_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File is too large. Maximum size is {settings.max_upload_size_mb} MB",
            )

        chunks.append(chunk)

    return b"".join(chunks)


@router.post("", response_model=PerformanceLogOut, status_code=status.HTTP_201_CREATED)
def create_performance_log(
    car_id: UUID,
    payload: PerformanceLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(car_id=car_id, user_id=current_user.id, db=db)

    performance_log = PerformanceLog(
        car_id=car.id,
        **payload.model_dump(),
    )

    db.add(performance_log)
    db.commit()
    db.refresh(performance_log)

    return performance_log


@router.get("", response_model=list[PerformanceLogOut])
def list_performance_logs(
    car_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(car_id=car_id, user_id=current_user.id, db=db)

    statement = (
        select(PerformanceLog)
        .options(selectinload(PerformanceLog.photos))
        .where(PerformanceLog.car_id == car.id)
        .order_by(PerformanceLog.occurred_at.desc())
    )

    return db.scalars(statement).all()


@router.get("/{log_id}", response_model=PerformanceLogOut)
def get_performance_log(
    car_id: UUID,
    log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(car_id=car_id, user_id=current_user.id, db=db)

    performance_log = db.scalar(
        select(PerformanceLog)
        .options(selectinload(PerformanceLog.photos))
        .where(
            PerformanceLog.id == log_id,
            PerformanceLog.car_id == car.id,
        )
    )

    if performance_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance log not found",
        )

    return performance_log


@router.patch("/{log_id}", response_model=PerformanceLogOut)
def update_performance_log(
    car_id: UUID,
    log_id: UUID,
    payload: PerformanceLogUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(car_id=car_id, user_id=current_user.id, db=db)

    performance_log = db.scalar(
        select(PerformanceLog).where(
            PerformanceLog.id == log_id,
            PerformanceLog.car_id == car.id,
        )
    )

    if performance_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance log not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    if "data" in update_data and update_data["data"] is None:
        update_data["data"] = {}

    for field, value in update_data.items():
        setattr(performance_log, field, value)

    db.commit()
    db.refresh(performance_log)

    return performance_log


@router.delete("/{log_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_performance_log(
    car_id: UUID,
    log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(car_id=car_id, user_id=current_user.id, db=db)

    performance_log = db.scalar(
        select(PerformanceLog)
        .options(selectinload(PerformanceLog.photos))
        .where(
            PerformanceLog.id == log_id,
            PerformanceLog.car_id == car.id,
        )
    )

    if performance_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance log not found",
        )

    log_photo_directory = Path(settings.upload_dir) / "logs" / str(performance_log.id)

    db.delete(performance_log)
    db.commit()

    shutil.rmtree(log_photo_directory, ignore_errors=True)

    return Response(status_code=status.HTTP_204_NO_CONTENT)


# Photo endpoints for performance logs


@router.post(
    "/{log_id}/photos",
    response_model=PerformanceLogPhotoOut,
    status_code=status.HTTP_201_CREATED,
)
async def upload_performance_log_photo(
    car_id: UUID,
    log_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(car_id=car_id, user_id=current_user.id, db=db)

    performance_log = db.scalar(
        select(PerformanceLog).where(
            PerformanceLog.id == log_id,
            PerformanceLog.car_id == car.id,
        )
    )

    if performance_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance log not found",
        )

    extension = validate_image_file(file)
    content = await read_file_with_size_limit(file, settings.max_upload_size_bytes)

    log_photo_directory = Path(settings.upload_dir) / "logs" / str(performance_log.id)
    log_photo_directory.mkdir(parents=True, exist_ok=True)

    stored_name = f"{uuid.uuid4()}{extension}"
    storage_path = log_photo_directory / stored_name
    storage_path.write_bytes(content)

    url_path = f"/media/logs/{performance_log.id}/{stored_name}"

    photo = PerformanceLogPhoto(
        performance_log_id=performance_log.id,
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


@router.delete("/{log_id}/photos/{photo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_performance_log_photo(
    car_id: UUID,
    log_id: UUID,
    photo_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(car_id=car_id, user_id=current_user.id, db=db)

    performance_log = db.scalar(
        select(PerformanceLog).where(
            PerformanceLog.id == log_id,
            PerformanceLog.car_id == car.id,
        )
    )

    if performance_log is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Performance log not found",
        )

    photo = db.scalar(
        select(PerformanceLogPhoto).where(
            PerformanceLogPhoto.id == photo_id,
            PerformanceLogPhoto.performance_log_id == performance_log.id,
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

    return Response(status_code=status.HTTP_204_NO_CONTENT)
