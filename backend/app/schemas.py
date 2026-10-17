from datetime import datetime, date
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from app.models import (
    CarDiscipline,
    CarStatus,
    Drivetrain,
    Transmission,
    MODIFICATION_CATEGORIES,
    MODIFICATION_PURPOSES,
)


class UserCreate(BaseModel):
    email: EmailStr
    username: str = Field(
        min_length=3,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_-]+$",
    )
    password: str = Field(
        min_length=8,
        max_length=128,
    )


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: UUID
    email: EmailStr
    username: str
    created_at: datetime
    model_config = ConfigDict(
        from_attributes=True,
    )


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class CarCreate(BaseModel):
    nickname: Optional[str] = Field(
        default=None,
        max_length=80,
    )
    year: int = Field(
        ge=1900,
        le=2100,
    )
    make: str = Field(
        min_length=1,
        max_length=80,
    )
    model: str = Field(
        min_length=1,
        max_length=120,
    )
    trim: Optional[str] = Field(
        default=None,
        max_length=120,
    )
    engine_code: Optional[str] = Field(
        default=None,
        max_length=40,
    )
    drivetrain: Optional[Drivetrain] = None
    transmission: Optional[Transmission] = None
    curb_weight_lb: Optional[int] = Field(
        default=None,
        ge=500,
        le=20000,
    )
    stock_hp: Optional[int] = Field(
        default=None,
        ge=0,
        le=5000,
    )

    stock_torque_lbft: Optional[int] = Field(
        default=None,
        ge=0,
        le=5000,
    )
    specs: dict = Field(
        default_factory=dict,
    )
    status: Optional[CarStatus] = CarStatus.PROJECT
    discipline: Optional[CarDiscipline] = None
    description: Optional[str] = Field(default=None, max_length=2000)
    goals: Optional[str] = Field(default=None, max_length=1000)


class CarUpdate(BaseModel):
    nickname: Optional[str] = Field(
        default=None,
        max_length=80,
    )
    year: Optional[int] = Field(
        ge=1900,
        le=2100,
    )
    make: Optional[str] = Field(
        min_length=1,
        max_length=80,
    )
    model: Optional[str] = Field(
        min_length=1,
        max_length=120,
    )
    trim: Optional[str] = Field(
        default=None,
        max_length=120,
    )
    engine_code: Optional[str] = Field(
        default=None,
        max_length=40,
    )
    drivetrain: Optional[Drivetrain] = None
    transmission: Optional[Transmission] = None
    curb_weight_lb: Optional[int] = Field(
        default=None,
        ge=500,
        le=20000,
    )
    stock_hp: Optional[int] = Field(
        default=None,
        ge=0,
        le=5000,
    )

    stock_torque_lbft: Optional[int] = Field(
        default=None,
        ge=0,
        le=5000,
    )
    specs: Optional[dict] = None
    status: Optional[CarStatus] = None
    discipline: Optional[CarDiscipline] = None
    description: Optional[str] = Field(default=None, max_length=2000)
    goals: Optional[str] = Field(default=None, max_length=1000)


class CarPhotoOut(BaseModel):
    id: UUID
    car_id: UUID
    original_filename: str
    url_path: str
    content_type: str
    size_bytes: int
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )


class CarOut(BaseModel):
    id: UUID
    owner_id: UUID
    nickname: Optional[str]
    year: int
    make: str
    model: str
    trim: Optional[str]
    engine_code: Optional[str]
    drivetrain: Optional[Drivetrain]
    transmission: Optional[Transmission]
    curb_weight_lb: Optional[int]
    stock_hp: Optional[int]
    stock_torque_lbft: Optional[int]
    specs: dict
    created_at: datetime
    updated_at: datetime
    status: Optional[CarStatus]
    discipline: Optional[CarDiscipline]
    description: Optional[str]
    goals: Optional[str]

    model_config = ConfigDict(
        from_attributes=True,
    )


class CarDetail(CarOut):
    photos: list[CarPhotoOut] = []


class ModificationCreate(BaseModel):
    category: str = Field(
        min_length=1,
        max_length=80,
    )
    purpose: Optional[str] = Field(
        default=None,
        max_length=80,
    )
    name: str = Field(
        min_length=1,
        max_length=160,
    )
    brand: Optional[str] = Field(
        default=None,
        max_length=120,
    )
    cost: Optional[float] = Field(
        default=None,
        ge=0,
        le=1000000,
    )
    estimated_hp_gain: Optional[int] = Field(
        default=None,
        ge=-1000,
        le=5000,
    )
    expected_result: Optional[str] = Field(
        default=None,
        max_length=1000,
    )
    actual_result: Optional[str] = Field(
        default=None,
        max_length=1000,
    )
    installed_at: Optional[date] = None
    notes: Optional[str] = Field(
        default=None,
        max_length=2000,
    )


class ModificationUpdate(BaseModel):
    category: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=80,
    )
    purpose: Optional[str] = Field(
        default=None,
        max_length=80,
    )
    name: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=160,
    )
    brand: Optional[str] = Field(
        default=None,
        max_length=120,
    )
    cost: Optional[float] = Field(
        default=None,
        ge=0,
        le=1000000,
    )
    estimated_hp_gain: Optional[int] = Field(
        default=None,
        ge=-1000,
        le=5000,
    )
    expected_result: Optional[str] = Field(
        default=None,
        max_length=1000,
    )
    actual_result: Optional[str] = Field(
        default=None,
        max_length=1000,
    )
    installed_at: Optional[date] = None
    notes: Optional[str] = Field(
        default=None,
        max_length=2000,
    )


class ModificationOut(BaseModel):
    id: UUID
    car_id: UUID
    category: str
    purpose: Optional[str]
    name: str
    brand: Optional[str]
    cost: Optional[float]
    estimated_hp_gain: Optional[int]
    expected_result: Optional[str]
    actual_result: Optional[str]
    installed_at: Optional[date]
    notes: Optional[str]
    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True,
    )
