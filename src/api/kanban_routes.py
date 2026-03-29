"""Kanban board routes - boards, columns, cards CRUD."""
import logging

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.database import get_db
from src.models.user import User
from src.models.kanban import Board, Column, Card
from src.auth.security import get_current_user
from src.api.schemas import (
    BoardCreate, BoardOut, BoardListOut,
    ColumnCreate, ColumnOut,
    CardCreate, CardUpdate, CardOut,
    APIResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/kanban", tags=["kanban"])


# --- Boards ---
@router.get("/boards", response_model=APIResponse)
async def list_boards(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Board).where(Board.user_id == user.id, Board.is_archived == False)
        .order_by(Board.updated_at.desc())
    )
    boards = result.scalars().all()
    return APIResponse(data=[BoardListOut.model_validate(b).model_dump(mode="json") for b in boards])


@router.post("/boards", response_model=APIResponse)
async def create_board(payload: BoardCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    board = Board(user_id=user.id, title=payload.title, description=payload.description, color=payload.color)
    db.add(board)
    await db.flush()

    # Create default columns
    for i, title in enumerate(["To Do", "In Progress", "Done"]):
        col = Column(board_id=board.id, title=title, position=i)
        db.add(col)
    await db.flush()
    await db.refresh(board)

    logger.info(f"Board created: {board.title} by {user.username}")
    return APIResponse(data=BoardOut.model_validate(board).model_dump(mode="json"))


@router.get("/boards/{board_id}", response_model=APIResponse)
async def get_board(board_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Board).where(Board.id == board_id, Board.user_id == user.id))
    board = result.scalar_one_or_none()
    if not board:
        return APIResponse(error="Board not found")
    return APIResponse(data=BoardOut.model_validate(board).model_dump(mode="json"))


@router.delete("/boards/{board_id}", response_model=APIResponse)
async def archive_board(board_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Board).where(Board.id == board_id, Board.user_id == user.id))
    board = result.scalar_one_or_none()
    if not board:
        return APIResponse(error="Board not found")
    board.is_archived = True
    return APIResponse(data={"archived": True})


# --- Columns ---
@router.post("/boards/{board_id}/columns", response_model=APIResponse)
async def add_column(board_id: str, payload: ColumnCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Board).where(Board.id == board_id, Board.user_id == user.id))
    board = result.scalar_one_or_none()
    if not board:
        return APIResponse(error="Board not found")

    max_pos = max((c.position for c in board.columns), default=-1) + 1
    col = Column(board_id=board.id, title=payload.title, position=max_pos)
    db.add(col)
    await db.flush()
    await db.refresh(col)
    return APIResponse(data=ColumnOut.model_validate(col).model_dump(mode="json"))


# --- Cards ---
@router.post("/columns/{column_id}/cards", response_model=APIResponse)
async def create_card(column_id: str, payload: CardCreate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Column).where(Column.id == column_id))
    col = result.scalar_one_or_none()
    if not col:
        return APIResponse(error="Column not found")

    # Verify ownership
    board_result = await db.execute(select(Board).where(Board.id == col.board_id, Board.user_id == user.id))
    if not board_result.scalar_one_or_none():
        return APIResponse(error="Not authorized")

    max_pos = max((c.position for c in col.cards), default=-1) + 1
    card = Card(
        column_id=column_id, title=payload.title, content=payload.content,
        tags=payload.tags, color=payload.color, position=max_pos, due_date=payload.due_date,
    )
    db.add(card)
    await db.flush()
    await db.refresh(card)
    return APIResponse(data=CardOut.model_validate(card).model_dump(mode="json"))


@router.patch("/cards/{card_id}", response_model=APIResponse)
async def update_card(card_id: str, payload: CardUpdate, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        return APIResponse(error="Card not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(card, key, value)

    await db.flush()
    await db.refresh(card)
    return APIResponse(data=CardOut.model_validate(card).model_dump(mode="json"))


@router.delete("/cards/{card_id}", response_model=APIResponse)
async def delete_card(card_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Card).where(Card.id == card_id))
    card = result.scalar_one_or_none()
    if not card:
        return APIResponse(error="Card not found")
    await db.delete(card)
    return APIResponse(data={"deleted": True})
