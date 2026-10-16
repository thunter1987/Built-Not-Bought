from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.cars import get_owned_car_or_404
from app.database import get_db
from app.dependencies import get_current_user
from app.models import Modification, User
from app.schemas import ModificationCreate, ModificationOut, ModificationUpdate

router = APIRouter(
    prefix="/cars/{car_id}/modifications",
    tags=["modifications"],
)


@router.post(
    "",
    response_model=ModificationOut,
    status_code=status.HTTP_201_CREATED,
)
def create_modification(
    car_id: UUID,
    payload: ModificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(
        car_id=car_id,
        user_id=current_user.id,
        db=db,
    )

    modification = Modification(
        car_id=car.id,
        **payload.model_dump(),
    )

    db.add(modification)
    db.commit()
    db.refresh(modification)

    return modification


@router.get(
    "",
    response_model=list[ModificationOut],
)
def list_modifications(
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
        select(Modification)
        .where(Modification.car_id == car.id)
        .order_by(Modification.installed_at.desc(), Modification.created_at.desc())
    )

    return db.scalars(statement).all()


@router.get(
    "/{modification_id}",
    response_model=ModificationOut,
)
def get_modification(
    car_id: UUID,
    modification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(
        car_id=car_id,
        user_id=current_user.id,
        db=db,
    )

    modification = db.scalar(
        select(Modification).where(
            Modification.id == modification_id,
            Modification.car_id == car.id,
        )
    )

    if modification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modification not found",
        )

    return modification


@router.patch(
    "/{modification_id}",
    response_model=ModificationOut,
)
def update_modification(
    car_id: UUID,
    modification_id: UUID,
    payload: ModificationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(
        car_id=car_id,
        user_id=current_user.id,
        db=db,
    )

    modification = db.scalar(
        select(Modification).where(
            Modification.id == modification_id,
            Modification.car_id == car.id,
        )
    )

    if modification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modification not found",
        )

    update_data = payload.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(modification, field, value)

    db.commit()
    db.refresh(modification)

    return modification


@router.delete(
    "/{modification_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_modification(
    car_id: UUID,
    modification_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(
        car_id=car_id,
        user_id=current_user.id,
        db=db,
    )

    modification = db.scalar(
        select(Modification).where(
            Modification.id == modification_id,
            Modification.car_id == car.id,
        )
    )

    if modification is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Modification not found",
        )

    db.delete(modification)
    db.commit()

    return Response(
        status_code=status.HTTP_204_NO_CONTENT,
    )
