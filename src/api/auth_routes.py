"""Authentication routes - register, login."""
import logging

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models.user import User
from src.auth.security import hash_password, verify_password, create_access_token
from src.api.schemas import UserRegister, UserLogin, UserOut, TokenOut, APIResponse

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=APIResponse)
async def register(payload: UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user."""
    # Check existing
    existing = await db.execute(
        select(User).where((User.username == payload.username) | (User.email == payload.email))
    )
    if existing.scalar_one_or_none():
        return APIResponse(error="Username or email already taken")

    user = User(
        username=payload.username,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    logger.info(f"New user registered: {user.username}")
    return APIResponse(data=UserOut.model_validate(user).model_dump(mode="json"))


@router.post("/login", response_model=APIResponse)
async def login(payload: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login and receive JWT token."""
    result = await db.execute(select(User).where(User.username == payload.username))
    user = result.scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        return APIResponse(error="Invalid username or password")

    token = create_access_token(data={"sub": str(user.id)})
    logger.info(f"User logged in: {user.username}")
    return APIResponse(data=TokenOut(access_token=token).model_dump())
