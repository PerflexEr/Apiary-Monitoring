from typing import List, Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from shared.service import BaseService
from . import models, schemas


class HiveService(BaseService[models.Hive]):
    def __init__(self):
        super().__init__(models.Hive)

    async def create_hive(
        self, db: AsyncSession, hive: schemas.HiveCreate, user_id: int
    ) -> models.Hive:
        db_hive = models.Hive(**hive.model_dump(), user_id=user_id)
        db.add(db_hive)
        await db.commit()
        await db.refresh(db_hive)
        return db_hive

    async def get_hives_by_user(
        self, db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[models.Hive]:
        query = (
            select(self.model)
            .filter(self.model.user_id == user_id)
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def get_hive_with_stats(
        self, db: AsyncSession, hive_id: int, user_id: int
    ) -> Optional[models.Hive]:
        # Get hive with inspections
        query = (
            select(self.model)
            .filter(self.model.id == hive_id)
            .filter(self.model.user_id == user_id)
            .options(selectinload(self.model.inspections))
        )
        result = await db.execute(query)
        hive = result.scalar_one_or_none()

        if not hive:
            return None

        # Calculate statistics
        stats_query = (
            select(
                func.avg(models.Inspection.temperature).label("avg_temperature"),
                func.avg(models.Inspection.humidity).label("avg_humidity"),
                func.avg(models.Inspection.weight).label("avg_weight"),
                func.max(models.Inspection.created_at).label("last_inspection_date"),
            )
            .filter(models.Inspection.hive_id == hive_id)
        )
        stats_result = await db.execute(stats_query)
        stats = stats_result.one()

        # Set hive status to latest inspection status
        if hive.inspections:
            latest = max(hive.inspections, key=lambda i: i.created_at)
            hive.status = latest.status or "healthy"
        else:
            hive.status = "healthy"

        # Add statistics fields
        setattr(hive, 'avg_temperature', stats.avg_temperature)
        setattr(hive, 'avg_humidity', stats.avg_humidity)
        setattr(hive, 'avg_weight', stats.avg_weight)
        setattr(hive, 'last_inspection_date', stats.last_inspection_date)

        return hive

    async def delete(self, db: AsyncSession, hive_id: int) -> bool:
        """Delete a hive by ID."""
        hive = await self.get(db, hive_id)
        if not hive:
            return False
        await db.delete(hive)
        await db.commit()
        return True


class InspectionService(BaseService[models.Inspection]):
    def __init__(self):
        super().__init__(models.Inspection)

    async def create_inspection(
        self, db: AsyncSession, inspection: schemas.InspectionCreate, user_id: int
    ) -> models.Inspection:
        db_inspection = models.Inspection(
            **inspection.model_dump(),
            user_id=user_id
        )
        db.add(db_inspection)
        await db.commit()
        await db.refresh(db_inspection)
        return db_inspection

    async def get_inspections_by_hive(
        self, db: AsyncSession, hive_id: int, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[models.Inspection]:
        query = (
            select(self.model)
            .filter(self.model.hive_id == hive_id)
            .filter(self.model.user_id == user_id)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()