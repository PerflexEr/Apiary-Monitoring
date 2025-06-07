from typing import Optional, List
from pydantic import BaseModel
from datetime import datetime
from shared.base_models import BaseSchema


class InspectionBase(BaseSchema):
    temperature: float
    humidity: float
    weight: float
    notes: Optional[str] = None


class InspectionCreate(InspectionBase):
    hive_id: int


class InspectionUpdate(BaseSchema):
    temperature: Optional[float] = None
    humidity: Optional[float] = None
    weight: Optional[float] = None
    notes: Optional[str] = None


class InspectionResponse(InspectionBase):
    id: int
    hive_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class HiveBase(BaseSchema):
    name: str
    location: str
    status: str = "active"  # Простая строка вместо enum
    queen_year: int
    frames_count: int
    description: Optional[str] = None


class HiveCreate(HiveBase):
    pass


class HiveUpdate(BaseSchema):
    name: Optional[str] = None
    location: Optional[str] = None
    status: Optional[str] = None  # Простая строка
    queen_year: Optional[int] = None
    frames_count: Optional[int] = None
    description: Optional[str] = None


class HiveResponse(HiveBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        exclude = {"inspections"}


class HiveWithInspections(HiveResponse):
    inspections: List[InspectionResponse] = []


class HiveWithStats(HiveWithInspections):
    avg_temperature: Optional[float] = None
    avg_humidity: Optional[float] = None
    avg_weight: Optional[float] = None
    last_inspection_date: Optional[datetime] = None