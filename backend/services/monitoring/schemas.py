from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from shared.base_models import BaseSchema


class SensorBase(BaseSchema):
    name: str
    sensor_type: str
    hive_id: int
    is_active: bool = True


class SensorCreate(SensorBase):
    pass


class SensorUpdate(BaseSchema):
    name: Optional[str] = None
    is_active: Optional[bool] = None


class SensorResponse(SensorBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class MeasurementBase(BaseSchema):
    value: float
    battery_level: float


class MeasurementCreate(MeasurementBase):
    sensor_id: int


class MeasurementResponse(MeasurementBase):
    id: int
    sensor_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class AlertBase(BaseSchema):
    alert_type: str
    message: str
    sensor_id: int
    hive_id: int
    is_resolved: bool = False


class AlertCreate(AlertBase):
    pass


class AlertUpdate(BaseSchema):
    is_resolved: bool


class AlertResponse(AlertBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None


class SensorStats(BaseSchema):
    sensor_id: int
    sensor_name: str
    sensor_type: str
    last_value: Optional[float]
    min_value: Optional[float]
    max_value: Optional[float]
    avg_value: Optional[float]
    battery_level: Optional[float]
    last_measurement_time: Optional[datetime]