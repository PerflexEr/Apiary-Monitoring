from typing import List, Optional
from datetime import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from shared.service import BaseService
from . import models, schemas

logger = logging.getLogger(__name__)


class NotificationTemplateService(BaseService[models.NotificationTemplate]):
    def __init__(self):
        super().__init__(models.NotificationTemplate)

    async def create_template(
        self, db: AsyncSession, template: schemas.NotificationTemplateCreate
    ) -> models.NotificationTemplate:
        try:
            logger.debug(f"Creating template: {template.model_dump()}")
            db_template = models.NotificationTemplate(**template.model_dump())
            db.add(db_template)
            await db.commit()
            await db.refresh(db_template)
            logger.debug(f"Template created successfully: {db_template.id}")
            return db_template
        except Exception as e:
            logger.error(f"Error creating template: {str(e)}", exc_info=True)
            await db.rollback()
            raise

    async def get_template_by_name(
        self, db: AsyncSession, name: str
    ) -> Optional[models.NotificationTemplate]:
        try:
            logger.debug(f"Getting template by name: {name}")
            query = select(self.model).filter(self.model.name == name)
            result = await db.execute(query)
            template = result.scalar_one_or_none()
            logger.debug(f"Template found: {template.id if template else None}")
            return template
        except Exception as e:
            logger.error(f"Error getting template by name: {str(e)}", exc_info=True)
            raise

    async def get_all(
        self, db: AsyncSession, skip: int = 0, limit: int = 100
    ) -> List[models.NotificationTemplate]:
        try:
            logger.debug(f"Getting all templates with skip={skip}, limit={limit}")
            query = select(self.model).offset(skip).limit(limit)
            result = await db.execute(query)
            templates = result.scalars().all()
            logger.debug(f"Found {len(templates)} templates")
            return templates
        except Exception as e:
            logger.error(f"Error getting all templates: {str(e)}", exc_info=True)
            raise


class NotificationSettingsService(BaseService[models.NotificationSettings]):
    def __init__(self):
        super().__init__(models.NotificationSettings)

    async def get_user_settings(
        self, db: AsyncSession, user_id: int
    ) -> Optional[models.NotificationSettings]:
        query = select(self.model).filter(self.model.user_id == user_id)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create_settings(
        self, db: AsyncSession, settings: schemas.NotificationSettingsCreate, user_id: int
    ) -> models.NotificationSettings:
        db_settings = models.NotificationSettings(
            **settings.model_dump(),
            user_id=user_id
        )
        db.add(db_settings)
        await db.commit()
        await db.refresh(db_settings)
        return db_settings

    async def update_settings(
        self, db: AsyncSession, user_id: int, settings: schemas.NotificationSettingsUpdate
    ) -> Optional[models.NotificationSettings]:
        db_settings = await self.get_user_settings(db, user_id)
        if not db_settings:
            return None

        update_data = settings.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_settings, field, value)

        await db.commit()
        await db.refresh(db_settings)
        return db_settings


class NotificationService(BaseService[models.Notification]):
    def __init__(self):
        super().__init__(models.Notification)

    async def create_notification(
        self, db: AsyncSession, notification: schemas.NotificationCreate, user_id: int
    ) -> models.Notification:
        db_notification = models.Notification(
            **notification.model_dump(),
            user_id=user_id
        )
        db.add(db_notification)
        await db.commit()
        await db.refresh(db_notification)
        return db_notification

    async def get_pending_notifications(
        self, db: AsyncSession, limit: int = 100
    ) -> List[models.Notification]:
        query = (
            select(self.model)
            .filter(self.model.is_sent == False)
            .order_by(self.model.created_at)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all()

    async def mark_as_sent(
        self, db: AsyncSession, notification_id: int, error_message: Optional[str] = None
    ) -> Optional[models.Notification]:
        notification = await self.get(db, notification_id)
        if not notification:
            return None

        notification.is_sent = True
        notification.sent_at = datetime.utcnow().isoformat()
        if error_message:
            notification.error_message = error_message

        await db.commit()
        await db.refresh(notification)
        return notification

    async def get_user_notifications(
        self, db: AsyncSession, user_id: int, skip: int = 0, limit: int = 100
    ) -> List[models.Notification]:
        query = (
            select(self.model)
            .filter(self.model.user_id == user_id)
            .order_by(self.model.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await db.execute(query)
        return result.scalars().all() 