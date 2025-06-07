from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from shared.database import get_db
from shared.cors import setup_cors
from services.auth.service import UserService
from services.auth import schemas as auth_schemas
from . import schemas
from .service import (
    NotificationTemplateService,
    NotificationSettingsService,
    NotificationService,
)
from .config import SECRET_KEY, ALGORITHM

app = FastAPI(title="Notification Service", version="1.0.0")

# Настраиваем CORS
setup_cors(app)

template_service = NotificationTemplateService()
settings_service = NotificationSettingsService()
notification_service = NotificationService()
user_service = UserService()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8000/token")


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> auth_schemas.User:
    try:
        user = await user_service.get_current_user(db, token)
        if user is None:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        return user
    except Exception as e:
        raise HTTPException(status_code=401, detail="Could not validate credentials")


async def get_current_active_user(
    current_user: auth_schemas.User = Depends(get_current_user)
) -> auth_schemas.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


@app.get("/health")
async def health() -> dict:
    """Health check endpoint"""
    return {"status": "healthy", "service": "notification"}


@app.post("/templates/", response_model=schemas.NotificationTemplate)
async def create_template(
    template: schemas.NotificationTemplateCreate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.NotificationTemplate:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_template = await template_service.create_template(db=db, template=template)
    return schemas.NotificationTemplate.model_validate(db_template)


@app.get("/templates/", response_model=List[schemas.NotificationTemplate])
async def read_templates(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.NotificationTemplate]:
    db_templates = await template_service.get_all(db, skip=skip, limit=limit)
    return [schemas.NotificationTemplate.model_validate(t) for t in db_templates]


@app.get("/settings/me/", response_model=schemas.NotificationSettings)
async def read_user_settings(
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.NotificationSettings:
    settings = await settings_service.get_user_settings(db, current_user.id)
    if not settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return schemas.NotificationSettings.model_validate(settings)


@app.post("/settings/", response_model=schemas.NotificationSettings)
async def create_user_settings(
    settings: schemas.NotificationSettingsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.NotificationSettings:
    existing_settings = await settings_service.get_user_settings(db, current_user.id)
    if existing_settings:
        raise HTTPException(
            status_code=400,
            detail="Settings already exist"
        )
    db_settings = await settings_service.create_settings(
        db=db, settings=settings, user_id=current_user.id
    )
    return schemas.NotificationSettings.model_validate(db_settings)


@app.put("/settings/me/", response_model=schemas.NotificationSettings)
async def update_user_settings(
    settings: schemas.NotificationSettingsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.NotificationSettings:
    updated_settings = await settings_service.update_settings(
        db, current_user.id, settings
    )
    if not updated_settings:
        raise HTTPException(status_code=404, detail="Settings not found")
    return schemas.NotificationSettings.model_validate(updated_settings)


@app.post("/notifications/", response_model=schemas.Notification)
async def create_notification(
    notification: schemas.NotificationCreate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.Notification:
    # Проверяем существование шаблона
    template = await template_service.get(db, notification.template_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db_notification = await notification_service.create_notification(
        db=db, notification=notification, user_id=current_user.id
    )
    return schemas.Notification.model_validate(db_notification)


@app.get("/notifications/", response_model=List[schemas.Notification])
async def read_notifications(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.Notification]:
    db_notifications = await notification_service.get_user_notifications(
        db, current_user.id, skip=skip, limit=limit
    )
    return [schemas.Notification.model_validate(n) for n in db_notifications]


@app.get("/notifications/pending/", response_model=List[schemas.Notification])
async def read_pending_notifications(
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.Notification]:
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    db_notifications = await notification_service.get_pending_notifications(db, limit=limit)
    return [schemas.Notification.model_validate(n) for n in db_notifications]