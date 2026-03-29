"""Focus session routes - Pomodoro timer management."""
import logging
from datetime import datetime

from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.config import settings
from src.models.user import User
from src.models.focus_session import FocusSession
from src.auth.security import get_current_user
from src.api.schemas import FocusSessionCreate, FocusSessionEnd, FocusSessionOut, APIResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/focus", tags=["focus"])


@router.post("/start", response_model=APIResponse)
async def start_focus_session(
    payload: FocusSessionCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Start a new Pomodoro focus session."""
    # Check for active session
    active = await db.execute(
        select(FocusSession).where(
            FocusSession.user_id == user.id,
            FocusSession.ended_at.is_(None),
        )
    )
    if active.scalar_one_or_none():
        return APIResponse(error="You already have an active focus session. Finish it first!")

    session = FocusSession(
        user_id=user.id,
        task_description=payload.task_description,
        duration_minutes=payload.duration_minutes,
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)

    logger.info(f"Focus session started: {user.username} - {payload.task_description}")
    return APIResponse(data=FocusSessionOut.model_validate(session).model_dump(mode="json"))


@router.post("/{session_id}/end", response_model=APIResponse)
async def end_focus_session(
    session_id: str,
    payload: FocusSessionEnd,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """End an active focus session."""
    result = await db.execute(
        select(FocusSession).where(
            FocusSession.id == session_id,
            FocusSession.user_id == user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return APIResponse(error="Focus session not found")

    if session.ended_at:
        return APIResponse(error="Session already ended")

    session.ended_at = datetime.utcnow()
    session.completed = payload.completed
    await db.flush()
    await db.refresh(session)

    # Update streak
    today = datetime.utcnow().date()
    if payload.completed:
        if user.last_active_date and user.last_active_date.date() == today:
            pass  # Already counted today
        elif user.last_active_date and (today - user.last_active_date.date()).days == 1:
            user.streak_days += 1
            user.last_active_date = datetime.utcnow()
        elif user.last_active_date and (today - user.last_active_date.date()).days > 1:
            user.streak_days = 1  # Reset streak
            user.last_active_date = datetime.utcnow()
        else:
            user.streak_days = 1
            user.last_active_date = datetime.utcnow()

    logger.info(f"Focus session ended: {user.username}, completed={payload.completed}")
    return APIResponse(data=FocusSessionOut.model_validate(session).model_dump(mode="json"))


@router.get("/active", response_model=APIResponse)
async def get_active_session(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current active focus session, if any."""
    result = await db.execute(
        select(FocusSession).where(
            FocusSession.user_id == user.id,
            FocusSession.ended_at.is_(None),
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        return APIResponse(data=None)
    return APIResponse(data=FocusSessionOut.model_validate(session).model_dump(mode="json"))


@router.get("/history", response_model=APIResponse)
async def get_focus_history(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's focus session history."""
    result = await db.execute(
        select(FocusSession)
        .where(FocusSession.user_id == user.id)
        .order_by(FocusSession.started_at.desc())
        .limit(50)
    )
    sessions = result.scalars().all()
    data = [FocusSessionOut.model_validate(s).model_dump(mode="json") for s in sessions]
    return APIResponse(data=data)


@router.get("/stats", response_model=APIResponse)
async def get_focus_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get focus statistics for current user."""
    total_result = await db.execute(
        select(
            func.count(FocusSession.id),
            func.sum(FocusSession.duration_minutes),
        ).where(
            FocusSession.user_id == user.id,
            FocusSession.completed.is_(True),
        )
    )
    row = total_result.one()
    return APIResponse(data={
        "total_sessions": row[0] or 0,
        "total_focus_minutes": row[1] or 0,
        "streak_days": user.streak_days,
    })
