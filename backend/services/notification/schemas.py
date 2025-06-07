from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr
from shared.base_models import BaseSchema
from .models import NotificationType, NotificationPriority


class NotificationTemplateBase(BaseSchema):
    name: str
    subject: str
    body: str
    notification_type: NotificationType


class NotificationTemplateCreate(NotificationTemplateBase):
    pass


class NotificationTemplate(NotificationTemplateBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class NotificationSettingsBase(BaseSchema):
    email_enabled: bool = True
    sms_enabled: bool = False
    push_enabled: bool = True
    email_address: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    min_priority: NotificationPriority = NotificationPriority.MEDIUM


class NotificationSettingsCreate(NotificationSettingsBase):
    pass


class NotificationSettingsUpdate(BaseSchema):
    email_enabled: Optional[bool] = None
    sms_enabled: Optional[bool] = None
    push_enabled: Optional[bool] = None
    email_address: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    min_priority: Optional[NotificationPriority] = None


class NotificationSettings(NotificationSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class NotificationBase(BaseSchema):
    template_id: int
    notification_type: NotificationType
    priority: NotificationPriority
    subject: str
    body: str


class NotificationCreate(NotificationBase):
    pass


class Notification(NotificationBase):
    id: int
    user_id: int
    is_sent: bool
    sent_at: Optional[str] = None
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None