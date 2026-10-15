import shutil
from pathlib import Path
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload
from app.config import settings
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Car, User
from app.schemas import CarCreate, CarDetail, CarOut, CarUpdate

router = APIRouter(
    prefix="/cars",
    tags=["cars"],
)


def get_owned_car_or_404(
    car_id: UUID,
    user_id: UUID,
    db: Session,
) -> Car:
    car = db.scalar(
        select(Car).where(
            Car.id == car_id,
            Car.owner_id == user_id,
        )
    )

    if car is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found",
        )

    return car


@router.post(
    "",
    response_model=CarOut,
    status_code=status.HTTP_201_CREATED,
)
def create_car(
    payload: CarCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = Car(owner_id=current_user.id, **payload.model_dump())

    db.add(car)
    db.commit()
    db.refresh(car)

    return car


@router.get(
    "",
    response_model=list[CarOut],
)
def list_cars(
    db: Session = Depends(get_db),
    curremt_user: User = Depends(get_current_user),
):
    statement = (
        select(Car)
        .where(Car.owner_id == curremt_user.id)
        .order_by(Car.created_at.desc())
    )

    return db.scalars(statement).all()


@router.get(
    "/{car_id}",
    response_model=CarDetail,
)
def get_car(
    car_id: UUID,
    db: Session = Depends(get_db),
    curremt_user: User = Depends(get_current_user),
):
    car = db.scalar(
        select(Car)
        .options(selectinload(Car.photos))
        .where(
            Car.id == car_id,
            Car.owner_id == curremt_user.id,
        )
    )
    if car is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found",
        )

    return car


@router.patch(
    "/{car_id}",
    response_model=CarOut,
)
def update_car(
    car_id: UUID,
    payload: CarUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(
        car_id=car_id,
        user_id=current_user.id,
        db=db,
    )

    update_data = payload.model_dump(exclude_unset=True)
    if "specs" in update_data and update_data["specs"] is None:
        update_data["specs"] = {}

    for field, value in update_data.items():
        setattr(car, field, value)

    db.commit()
    db.refresh(car)

    return car


@router.delete(
    "/{car_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_car(
    car_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = db.scalar(
        select(Car)
        .options(selectinload(Car.photos))
        .where(
            Car.id == car_id,
            Car.owner_id == current_user.id,
        )
    )
    if car is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Car not found",
        )
    car_photo_directory = Path(settings.upload_dir) / "cars" / str(car.id)

    db.delete(car)
    db.commit()

    shutil.rmtree(
        car_photo_directory,
        ignore_errors=True,
    )

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
