from typing import Generic, TypeVar, Type, Optional, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete
from sqlalchemy.exc import SQLAlchemyError
from .database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseService(Generic[ModelType]):
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def create(self, db: AsyncSession, **kwargs) -> ModelType:
        try:
            db_obj = self.model(**kwargs)
            db.add(db_obj)
            await db.commit()
            await db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            await db.rollback()
            raise e

    async def get(self, db: AsyncSession, id: int) -> Optional[ModelType]:
        query = select(self.model).filter(self.model.id == id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_all(self, db: AsyncSession, skip: int = 0, limit: int = 100) -> List[ModelType]:
        query = select(self.model).offset(skip).limit(limit)
        result = await db.execute(query)
        return result.scalars().all()

    async def update(self, db: AsyncSession, id: int, **kwargs) -> Optional[ModelType]:
        try:
            query = update(self.model).where(self.model.id == id).values(**kwargs).returning(self.model)
            result = await db.execute(query)
            await db.commit()
            return result.scalar_one_or_none()
        except SQLAlchemyError as e:
            await db.rollback()
            raise e

    async def delete(self, db: AsyncSession, id: int) -> bool:
        try:
            query = delete(self.model).where(self.model.id == id)
            result = await db.execute(query)
            await db.commit()
            return result.rowcount > 0
        except SQLAlchemyError as e:
            await db.rollback()
            raise e 