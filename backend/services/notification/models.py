from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Enum
import enum
from shared.database import Base, TimestampMixin


class NotificationType(str, enum.Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"


class NotificationPriority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class NotificationTemplate(Base, TimestampMixin):
    __tablename__ = "notification_templates"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    subject = Column(String)
    body = Column(String)
    notification_type = Column(String)

    def __init__(self, **kwargs):
        if 'notification_type' in kwargs and isinstance(kwargs['notification_type'], NotificationType):
            kwargs['notification_type'] = kwargs['notification_type'].value
        super().__init__(**kwargs)


class NotificationSettings(Base, TimestampMixin):
    __tablename__ = "notification_settings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    email_enabled = Column(Boolean, default=True)
    sms_enabled = Column(Boolean, default=False)
    push_enabled = Column(Boolean, default=True)
    email_address = Column(String, nullable=True)
    phone_number = Column(String, nullable=True)
    min_priority = Column(String, default=NotificationPriority.MEDIUM.value)

    def __init__(self, **kwargs):
        if 'min_priority' in kwargs and isinstance(kwargs['min_priority'], NotificationPriority):
            kwargs['min_priority'] = kwargs['min_priority'].value
        super().__init__(**kwargs)


class Notification(Base, TimestampMixin):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    template_id = Column(Integer, ForeignKey("notification_templates.id"))
    notification_type = Column(String)
    priority = Column(String)
    subject = Column(String)
    body = Column(String)
    is_sent = Column(Boolean, default=False)
    sent_at = Column(String, nullable=True)
    error_message = Column(String, nullable=True)

    def __init__(self, **kwargs):
        if 'notification_type' in kwargs and isinstance(kwargs['notification_type'], NotificationType):
            kwargs['notification_type'] = kwargs['notification_type'].value
        if 'priority' in kwargs and isinstance(kwargs['priority'], NotificationPriority):
            kwargs['priority'] = kwargs['priority'].value
        super().__init__(**kwargs)