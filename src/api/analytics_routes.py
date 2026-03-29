"""Analytics routes - weekly summaries (AI-powered, background only)."""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models.user import User
from src.models.analytics import WeeklyAnalytics
from src.auth.security import get_current_user
from src.api.schemas import WeeklyAnalyticsOut, APIResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analytics", tags=["analytics"])


@router.get("/weekly", response_model=APIResponse)
async def get_weekly_analytics(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get user's weekly analytics summaries."""
    result = await db.execute(
        select(WeeklyAnalytics)
        .where(WeeklyAnalytics.user_id == user.id)
        .order_by(WeeklyAnalytics.week_start.desc())
        .limit(12)
    )
    analytics = result.scalars().all()
    data = [WeeklyAnalyticsOut.model_validate(a).model_dump(mode="json") for a in analytics]
    return APIResponse(data=data)


@router.get("/latest", response_model=APIResponse)
async def get_latest_analytics(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get the most recent weekly summary."""
    result = await db.execute(
        select(WeeklyAnalytics)
        .where(WeeklyAnalytics.user_id == user.id)
        .order_by(WeeklyAnalytics.week_start.desc())
        .limit(1)
    )
    analytics = result.scalar_one_or_none()
    if not analytics:
        return APIResponse(data=None)
    return APIResponse(data=WeeklyAnalyticsOut.model_validate(analytics).model_dump(mode="json"))
