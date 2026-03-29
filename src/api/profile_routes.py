"""Profile routes - user profile management."""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models.user import User
from src.auth.security import get_current_user
from src.api.schemas import UserOut, UserProfileUpdate, APIResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/profile", tags=["profile"])


@router.get("/me", response_model=APIResponse)
async def get_profile(user: User = Depends(get_current_user)):
    return APIResponse(data=UserOut.model_validate(user).model_dump(mode="json"))


@router.patch("/me", response_model=APIResponse)
async def update_profile(
    payload: UserProfileUpdate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(user, key, value)
    await db.flush()
    await db.refresh(user)
    logger.info(f"Profile updated: {user.username}")
    return APIResponse(data=UserOut.model_validate(user).model_dump(mode="json"))
