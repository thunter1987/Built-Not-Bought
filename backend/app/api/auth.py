from app.database import get_db
from app.dependencies import get_current_user
from app.models import User
from app.schemas import Token, UserCreate, UserLogin, UserOut
from app.security import (
    create_access_token,
    hash_password,
    DUMMY_HASH,
    password_needs_rehash,
    verify_password,
)
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

router = APIRouter(
    prefix="/auth",
    tags=["auth"],
)


@router.post(
    "/register",
    response_model=UserOut,
    status_code=status.HTTP_201_CREATED,
)
def register(
    payload: UserCreate,
    db: Session = Depends(get_db),
):
    email = payload.email.lower()
    username = payload.username.lower()

    existing_email = db.scalar(select(User.id).where(User.email == email))

    if existing_email is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email is already registered",
        )

    existing_username = db.scalar(select(User.id).where(User.username == username))

    if existing_username is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username is already registered",
        )

    user = User(
        email=email, username=username, hashed_password=hash_password(payload.password)
    )

    db.add(user)
    try:
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email or username already registered",
        ) from e
    db.refresh(user)

    return user


@router.post(
    "/login",
    response_model=Token,
)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    email = payload.email.lower()

    user = db.scalar(select(User).where(User.email == email))

    password_hash = user.hashed_password if user else DUMMY_HASH

    if user is None or not verify_password(
        payload.password,
        password_hash,
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if password_needs_rehash(user.hashed_password):
        user.hashed_password = hash_password(payload.password)
        db.commit()

    access_token = create_access_token(str(user.id))

    return Token(access_token=access_token)


@router.get("/me", response_model=UserOut)
def me(
    current_user: User = Depends(get_current_user),
):
    return current_user
