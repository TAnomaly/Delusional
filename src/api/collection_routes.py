"""Collection routes - curated collections of tools, apps, workflows."""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models.user import User
from src.models.collection import Collection, CollectionItem
from src.auth.security import get_current_user
from src.api.schemas import (
    CollectionCreate, CollectionOut,
    CollectionItemCreate, CollectionItemOut,
    APIResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/collections", tags=["collections"])


@router.get("/", response_model=APIResponse)
async def list_my_collections(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Collection).where(Collection.user_id == user.id).order_by(Collection.updated_at.desc())
    )
    collections = result.scalars().all()
    return APIResponse(data=[CollectionOut.model_validate(c).model_dump(mode="json") for c in collections])


@router.get("/public", response_model=APIResponse)
async def list_public_collections(db: AsyncSession = Depends(get_db)):
    """Browse public collections from all users."""
    result = await db.execute(
        select(Collection).where(Collection.is_public == True).order_by(Collection.updated_at.desc()).limit(50)
    )
    collections = result.scalars().all()
    return APIResponse(data=[CollectionOut.model_validate(c).model_dump(mode="json") for c in collections])


@router.post("/", response_model=APIResponse)
async def create_collection(payload: CollectionCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    collection = Collection(
        user_id=user.id, title=payload.title,
        description=payload.description, is_public=payload.is_public,
    )
    db.add(collection)
    await db.flush()
    await db.refresh(collection)
    logger.info(f"Collection created: {collection.title} by {user.username}")
    return APIResponse(data=CollectionOut.model_validate(collection).model_dump(mode="json"))


@router.get("/{collection_id}", response_model=APIResponse)
async def get_collection(collection_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).where(Collection.id == collection_id))
    collection = result.scalar_one_or_none()
    if not collection:
        return APIResponse(error="Collection not found")
    if not collection.is_public and collection.user_id != user.id:
        return APIResponse(error="Not authorized")
    return APIResponse(data=CollectionOut.model_validate(collection).model_dump(mode="json"))


@router.post("/{collection_id}/items", response_model=APIResponse)
async def add_item(collection_id: str, payload: CollectionItemCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).where(Collection.id == collection_id, Collection.user_id == user.id))
    collection = result.scalar_one_or_none()
    if not collection:
        return APIResponse(error="Collection not found or not authorized")

    max_pos = max((i.position for i in collection.items), default=-1) + 1
    item = CollectionItem(
        collection_id=collection_id, title=payload.title,
        description=payload.description, url=payload.url,
        resource_type=payload.resource_type, tags=payload.tags, position=max_pos,
    )
    db.add(item)
    await db.flush()
    await db.refresh(item)
    return APIResponse(data=CollectionItemOut.model_validate(item).model_dump(mode="json"))


@router.delete("/{collection_id}/items/{item_id}", response_model=APIResponse)
async def remove_item(collection_id: str, item_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Collection).where(Collection.id == collection_id, Collection.user_id == user.id))
    if not result.scalar_one_or_none():
        return APIResponse(error="Not authorized")
    item_result = await db.execute(select(CollectionItem).where(CollectionItem.id == item_id))
    item = item_result.scalar_one_or_none()
    if not item:
        return APIResponse(error="Item not found")
    await db.delete(item)
    return APIResponse(data={"deleted": True})
