from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.cars import get_owned_car_or_404
from app.database import get_db
from app.dependencies import get_current_user
from app.models import (
    Car,
    Modification,
    PerformanceLog,
    PerformanceLogType,
    User,
)

router = APIRouter(
    prefix="/cars/{car_id}/analytics",
    tags=["analytics"],
)


def compute_power_progression(
    car: Car,
    modifications: list[Modification],
    performance_logs: list[PerformanceLog],
) -> list[dict]:
    """Build a timeline of HP: stock → mod gains → dyno verification."""
    points: list[dict] = []

    # Baseline: stock HP at car creation
    if car.stock_hp:
        points.append(
            {
                "date": car.created_at.date().isoformat(),
                "hp": float(car.stock_hp),
                "label": "Stock",
                "point_type": "baseline",
            }
        )

    # Cumulative mod gains at install dates
    cumulative_gain = 0
    mods_with_gains = sorted(
        [m for m in modifications if m.estimated_hp_gain and m.installed_at],
        key=lambda m: m.installed_at,
    )

    base_hp = car.stock_hp or 0

    for mod in mods_with_gains:
        cumulative_gain += mod.estimated_hp_gain
        points.append(
            {
                "date": mod.installed_at.isoformat(),
                "hp": float(base_hp + cumulative_gain),
                "label": mod.name,
                "point_type": "mod",
            }
        )

    # Actual dyno results as verification points
    dyno_logs = sorted(
        [
            log
            for log in performance_logs
            if log.log_type == PerformanceLogType.DYNO and log.horsepower is not None
        ],
        key=lambda log: log.occurred_at,
    )

    for log in dyno_logs:
        points.append(
            {
                "date": log.occurred_at.date().isoformat(),
                "hp": float(log.horsepower),
                "label": f"Dyno: {int(log.horsepower)} hp",
                "point_type": "dyno",
            }
        )

    # Sort chronologically
    points.sort(key=lambda p: p["date"])

    return points


def compute_lap_progression(
    performance_logs: list[PerformanceLog],
) -> dict[str, list[dict]]:
    """Group lap times by track, sorted chronologically."""
    track_logs = [
        log
        for log in performance_logs
        if log.log_type == PerformanceLogType.TRACK and log.lap_time_sec is not None
    ]

    by_track: dict[str, list[dict]] = {}

    for log in track_logs:
        track = log.track_name or log.location or "Unknown Track"

        if track not in by_track:
            by_track[track] = []

        by_track[track].append(
            {
                "date": log.occurred_at.date().isoformat(),
                "lap_time": float(log.lap_time_sec),
                "track": track,
            }
        )

    for track in by_track:
        by_track[track].sort(key=lambda x: x["date"])

    return by_track


def compute_acceleration_progression(
    performance_logs: list[PerformanceLog],
) -> list[dict]:
    """0–60 times over time."""
    accel_logs = sorted(
        [
            log
            for log in performance_logs
            if log.log_type == PerformanceLogType.ACCELERATION
            and log.zero_to_sixty_sec is not None
        ],
        key=lambda log: log.occurred_at,
    )

    return [
        {
            "date": log.occurred_at.date().isoformat(),
            "zero_to_sixty": float(log.zero_to_sixty_sec),
            "quarter_mile": (
                float(log.quarter_mile_sec) if log.quarter_mile_sec else None
            ),
            "trap_mph": float(log.quarter_mile_mph) if log.quarter_mile_mph else None,
        }
        for log in accel_logs
    ]


def compute_cost_analysis(
    modifications: list[Modification],
) -> dict:
    """Summarize build investment."""
    total_cost = sum(m.cost or 0 for m in modifications)
    total_hp_gain = sum(m.estimated_hp_gain or 0 for m in modifications)

    by_category: dict[str, dict] = {}

    for mod in modifications:
        category = mod.category

        if category not in by_category:
            by_category[category] = {
                "category": category,
                "cost": 0.0,
                "count": 0,
                "hp_gain": 0,
            }

        by_category[category]["cost"] += mod.cost or 0
        by_category[category]["count"] += 1
        by_category[category]["hp_gain"] += mod.estimated_hp_gain or 0

    breakdown = sorted(
        by_category.values(),
        key=lambda x: x["cost"],
        reverse=True,
    )

    cost_per_hp = round(total_cost / total_hp_gain, 2) if total_hp_gain > 0 else None

    return {
        "total_cost": total_cost,
        "total_estimated_hp_gain": total_hp_gain,
        "cost_per_hp": cost_per_hp,
        "mod_count": len(modifications),
        "by_category": breakdown,
    }


def compute_best_stats(
    performance_logs: list[PerformanceLog],
) -> dict:
    """Pull the best number from each session type."""
    dyno_logs = [
        log for log in performance_logs if log.log_type == PerformanceLogType.DYNO
    ]

    accel_logs = [
        log
        for log in performance_logs
        if log.log_type == PerformanceLogType.ACCELERATION
    ]

    track_logs = [
        log
        for log in performance_logs
        if log.log_type == PerformanceLogType.TRACK and log.lap_time_sec is not None
    ]

    braking_logs = [
        log
        for log in performance_logs
        if log.log_type == PerformanceLogType.BRAKING
        and log.sixty_to_zero_ft is not None
    ]

    best_hp = max((log.horsepower for log in dyno_logs if log.horsepower), default=None)
    best_torque = max(
        (log.torque_lbft for log in dyno_logs if log.torque_lbft), default=None
    )

    best_zero_to_sixty = min(
        (log.zero_to_sixty_sec for log in accel_logs if log.zero_to_sixty_sec),
        default=None,
    )

    best_quarter_mile = min(
        (log.quarter_mile_sec for log in accel_logs if log.quarter_mile_sec),
        default=None,
    )

    best_lap = min((log.lap_time_sec for log in track_logs), default=None)

    best_braking = min((log.sixty_to_zero_ft for log in braking_logs), default=None)

    return {
        "best_hp": best_hp,
        "best_torque": best_torque,
        "best_zero_to_sixty": best_zero_to_sixty,
        "best_quarter_mile": best_quarter_mile,
        "best_lap": best_lap,
        "best_braking": best_braking,
    }


@router.get("")
def get_analytics(
    car_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    car = get_owned_car_or_404(
        car_id=car_id,
        user_id=current_user.id,
        db=db,
    )

    modifications = db.scalars(
        select(Modification).where(Modification.car_id == car.id)
    ).all()

    performance_logs = db.scalars(
        select(PerformanceLog).where(PerformanceLog.car_id == car.id)
    ).all()

    # Stock vs current
    best_stats = compute_best_stats(performance_logs)

    current_hp = best_stats["best_hp"] or (
        (car.stock_hp or 0) + sum(m.estimated_hp_gain or 0 for m in modifications)
    )

    current_weight = car.curb_weight_lb

    stock_power_to_weight = (
        round(car.curb_weight_lb / car.stock_hp, 2)
        if car.stock_hp and car.curb_weight_lb
        else None
    )

    current_power_to_weight = (
        round(current_weight / current_hp, 2) if current_hp and current_weight else None
    )

    stock_vs_current = {
        "stock_hp": car.stock_hp,
        "current_hp": current_hp,
        "hp_gain": (current_hp - car.stock_hp) if car.stock_hp and current_hp else None,
        "stock_weight": car.curb_weight_lb,
        "current_weight": current_weight,
        "stock_power_to_weight": stock_power_to_weight,
        "current_power_to_weight": current_power_to_weight,
    }

    return {
        "best_stats": best_stats,
        "stock_vs_current": stock_vs_current,
        "cost_analysis": compute_cost_analysis(modifications),
        "power_progression": compute_power_progression(
            car, modifications, performance_logs
        ),
        "lap_progression": compute_lap_progression(performance_logs),
        "acceleration_progression": compute_acceleration_progression(performance_logs),
    }
