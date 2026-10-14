import enum
import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import (
    Date,
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Drivetrain(str, enum.Enum):
    FWD = "FWD"
    RWD = "RWD"
    AWD = "AWD"


class Transmission(str, enum.Enum):
    MANUAL = "manual"
    AUTOMATIC = "automatic"
    DCT = "dct"
    CVT = "cvt"


class PerformanceLogType(str, enum.Enum):
    DYNO = "dyno"
    ACCELERATION = "acceleration"
    TRACK = "track"
    BRAKING = "braking"


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    email: Mapped[str] = mapped_column(
        String(320),
        unique=True,
        index=True,
        nullable=False,
    )

    username: Mapped[str] = mapped_column(
        String(30),
        unique=True,
        index=True,
        nullable=False,
    )

    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    cars: Mapped[list["Car"]] = relationship(
        back_populates="owner",
        cascade="all, delete-orphan",
    )


class Car(Base):
    __tablename__ = "cars"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    nickname: Mapped[Optional[str]] = mapped_column(
        String(80),
        nullable=True,
    )

    year: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )

    make: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
        index=True,
    )

    model: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
        index=True,
    )

    trim: Mapped[Optional[str]] = mapped_column(
        String(120),
        nullable=True,
    )

    engine_code: Mapped[Optional[str]] = mapped_column(
        String(40),
        nullable=True,
    )

    drivetrain: Mapped[Optional[Drivetrain]] = mapped_column(
        Enum(Drivetrain),
        nullable=True,
    )

    transmission: Mapped[Optional[Transmission]] = mapped_column(
        Enum(Transmission),
        nullable=True,
    )

    curb_weight_lb: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    stock_hp: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    stock_torque_lbft: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    specs: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    owner: Mapped["User"] = relationship(
        back_populates="cars",
    )

    modifications: Mapped[list["Modification"]] = relationship(
        back_populates="car",
        cascade="all, delete-orphan",
    )

    performance_logs: Mapped[list["PerformanceLog"]] = relationship(
        back_populates="car",
        cascade="all, delete-orphan",
    )

    fuel_type: Mapped[Optional[str]] = mapped_column(
        String(40),
        nullable=True,
    )

    __table_args__ = (Index("ix_cars_make_model", "make", "model"),)


class Modification(Base):
    __tablename__ = "modifications"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    car_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cars.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    category: Mapped[str] = mapped_column(
        String(80),
        nullable=False,
    )

    name: Mapped[str] = mapped_column(
        String(160),
        nullable=False,
    )

    brand: Mapped[Optional[str]] = mapped_column(
        String(120),
        nullable=True,
    )

    cost: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    estimated_hp_gain: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True,
    )

    installed_at: Mapped[Optional[date]] = mapped_column(
        Date,
        nullable=True,
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    car: Mapped["Car"] = relationship(
        back_populates="modifications",
    )

    __table_args__ = (Index("ix_modifications_car_category", "car_id", "category"),)


class PerformanceLog(Base):
    __tablename__ = "performance_logs"

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
    )

    car_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("cars.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    log_type: Mapped[PerformanceLogType] = mapped_column(
        Enum(PerformanceLogType),
        nullable=False,
    )

    occurred_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    horsepower: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    torque_lbft: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    zero_to_sixty_sec: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    quarter_mile_sec: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    quarter_mile_mph: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    lap_time_sec: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )

    location: Mapped[Optional[str]] = mapped_column(
        String(160),
        nullable=True,
    )

    notes: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    data: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    car: Mapped["Car"] = relationship(
        back_populates="performance_logs",
    )

    __table_args__ = (
        Index("ix_performance_logs_car_occurred", "car_id", "occurred_at"),
    )
