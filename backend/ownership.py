from typing import Type, TypeVar

from fastapi import HTTPException
from sqlalchemy.orm import Session

from models import User

ModelT = TypeVar("ModelT")


def get_owned(db: Session, model: Type[ModelT], obj_id: int, current_user: User, not_found_message: str) -> ModelT:
    """Fetch a row by id, scoped to the current user via its user_id column, or raise 404."""
    obj = db.query(model).filter(model.id == obj_id, model.user_id == current_user.id).first()
    if not obj:
        raise HTTPException(status_code=404, detail=not_found_message)
    return obj
