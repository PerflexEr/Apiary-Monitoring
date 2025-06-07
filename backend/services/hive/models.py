from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
import enum
from shared.database import Base, TimestampMixin


class HiveStatus(str, enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"


class Hive(Base, TimestampMixin):
    __tablename__ = "hives"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    location = Column(String)
    description = Column(String, nullable=True)
    status = Column(String, default="healthy")  # теперь healthy по умолчанию
    queen_year = Column(Integer)
    frames_count = Column(Integer)
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    inspections = relationship("Inspection", back_populates="hive")

    # Статистические поля будут добавляться динамически в сервисе
    # Не определяем их здесь как атрибуты класса


class Inspection(Base, TimestampMixin):
    __tablename__ = "inspections"

    id = Column(Integer, primary_key=True, index=True)
    hive_id = Column(Integer, ForeignKey("hives.id"))
    temperature = Column(Float)
    humidity = Column(Float)
    weight = Column(Float)
    notes = Column(String)
    status = Column(String, nullable=True)  # теперь только status
    user_id = Column(Integer, ForeignKey("users.id"))

    # Relationships
    hive = relationship("Hive", back_populates="inspections")