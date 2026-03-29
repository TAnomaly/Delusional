"""Post routes - create and read posts with daily feed limit."""
import logging
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.config import settings
from src.models.user import User
from src.models.post import Post
from src.auth.security import get_current_user
from src.api.schemas import PostCreate, PostOut, APIResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/posts", tags=["posts"])


@router.post("/", response_model=APIResponse)
async def create_post(
    payload: PostCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Create a new post. Enforces daily feed limit."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    count_result = await db.execute(
        select(func.count(Post.id)).where(
            Post.author_id == user.id,
            Post.created_at >= today_start,
        )
    )
    today_count = count_result.scalar()

    if today_count >= settings.DAILY_FEED_LIMIT:
        return APIResponse(error=f"Daily post limit reached ({settings.DAILY_FEED_LIMIT}). Focus on real tasks!")

    post = Post(
        author_id=user.id,
        content=payload.content,
        tags=payload.tags,
        duration_minutes=payload.duration_minutes,
    )
    db.add(post)
    await db.flush()
    await db.refresh(post)

    logger.info(f"Post created by {user.username}, tags={post.tags}")
    return APIResponse(data=PostOut.model_validate(post).model_dump(mode="json"))


@router.get("/feed", response_model=APIResponse)
async def get_feed(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get today's feed - capped at DAILY_FEED_LIMIT posts."""
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(Post)
        .where(Post.created_at >= today_start)
        .order_by(Post.created_at.desc())
        .limit(settings.DAILY_FEED_LIMIT)
    )
    posts = result.scalars().all()
    data = [PostOut.model_validate(p).model_dump(mode="json") for p in posts]
    return APIResponse(data=data)


@router.get("/my", response_model=APIResponse)
async def get_my_posts(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current user's posts."""
    result = await db.execute(
        select(Post)
        .where(Post.author_id == user.id)
        .order_by(Post.created_at.desc())
        .limit(50)
    )
    posts = result.scalars().all()
    data = [PostOut.model_validate(p).model_dump(mode="json") for p in posts]
    return APIResponse(data=data)
