from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text, select
from datetime import datetime
import logging

from shared.database import get_db
from shared.cors import setup_cors
from services.auth.service import UserService
from services.auth import schemas as auth_schemas
# Импортируем модель Hive для правильной работы foreign key
from services.hive.models import Hive
from . import schemas, models
from .service import SensorService, MeasurementService, AlertService
from .config import SECRET_KEY, ALGORITHM

# Настройка логирования
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI(title="Monitoring Service", version="1.0.0")

# Настраиваем CORS
setup_cors(app)

sensor_service = SensorService()
measurement_service = MeasurementService()
alert_service = AlertService()
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
    return {"status": "healthy", "service": "monitoring"}


@app.post("/sensors/", response_model=schemas.SensorResponse)
async def create_sensor(
    sensor: schemas.SensorCreate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.SensorResponse:
    try:
        logger.debug(f"Creating sensor with data: {sensor.model_dump()}")
        logger.debug(f"Current user: {current_user.id}")
        
        # Проверяем существование улья и принадлежность его пользователю
        hive_query = select(Hive).filter(Hive.id == sensor.hive_id, Hive.user_id == current_user.id)
        result = await db.execute(hive_query)
        hive = result.scalar_one_or_none()
        
        if not hive:
            logger.warning(f"Hive not found or access denied. hive_id: {sensor.hive_id}, user_id: {current_user.id}")
            raise HTTPException(status_code=404, detail="Hive not found or access denied")
        
        logger.debug(f"Found hive: {hive.id}")
        created_sensor = await sensor_service.create_sensor(db=db, sensor=sensor, user_id=current_user.id)
        logger.debug(f"Successfully created sensor: {created_sensor.id}")
        return schemas.SensorResponse.model_validate(created_sensor)
    except Exception as e:
        logger.error(f"Error creating sensor: {str(e)}", exc_info=True)
        raise


@app.get("/sensors/", response_model=List[schemas.SensorResponse])
async def read_sensors(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.SensorResponse]:
    sensors = await sensor_service.get_sensors_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    return [schemas.SensorResponse.model_validate(s) for s in sensors]


@app.get("/sensors/{sensor_id}", response_model=schemas.SensorResponse)
async def read_sensor(
    sensor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.SensorResponse:
    sensor = await sensor_service.get_sensor(db, sensor_id, current_user.id)
    if sensor is None:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return schemas.SensorResponse.model_validate(sensor)


@app.get("/sensors/{sensor_id}/stats/", response_model=schemas.SensorStats)
async def read_sensor_stats(
    sensor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.SensorStats:
    stats = await sensor_service.get_sensor_stats(db, sensor_id, current_user.id)
    if stats is None:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return stats


@app.get("/sensors/{sensor_id}/measurements/", response_model=List[schemas.MeasurementResponse])
async def read_sensor_measurements(
    sensor_id: int,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.MeasurementResponse]:
    # Проверяем, что датчик принадлежит пользователю
    sensor = await sensor_service.get_sensor(db, sensor_id, current_user.id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    measurements = await measurement_service.get_measurements_by_sensor(
        db, sensor_id=sensor_id, start_date=start_date, end_date=end_date, limit=limit
    )
    return [schemas.MeasurementResponse.model_validate(m) for m in measurements]


@app.get("/hives/{hive_id}/sensors/", response_model=List[schemas.SensorResponse])
async def read_hive_sensors(
    hive_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.SensorResponse]:
    # Проверяем, что улей принадлежит пользователю
    hive_query = select(Hive).filter(Hive.id == hive_id, Hive.user_id == current_user.id)
    result = await db.execute(hive_query)
    hive = result.scalar_one_or_none()
    
    if not hive:
        raise HTTPException(status_code=404, detail="Hive not found or access denied")
    
    sensors = await sensor_service.get_sensors_by_hive(db, hive_id, current_user.id)
    return [schemas.SensorResponse.model_validate(s) for s in sensors]


@app.post("/measurements/", response_model=schemas.MeasurementResponse)
async def create_measurement(
    measurement: schemas.MeasurementCreate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.MeasurementResponse:
    # Проверяем, что датчик принадлежит пользователю
    sensor = await sensor_service.get_sensor(db, measurement.sensor_id, current_user.id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    db_measurement = await measurement_service.create_measurement(db=db, measurement=measurement)
    return schemas.MeasurementResponse.model_validate(db_measurement)


@app.get("/measurements/", response_model=List[schemas.MeasurementResponse])
async def read_measurements(
    sensor_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.MeasurementResponse]:
    if sensor_id:
        # Проверяем, что датчик принадлежит пользователю
        sensor = await sensor_service.get_sensor(db, sensor_id, current_user.id)
        if not sensor:
            raise HTTPException(status_code=404, detail="Sensor not found")
        
        measurements = await measurement_service.get_measurements_by_sensor(
            db, sensor_id=sensor_id, limit=limit
        )
    else:
        measurements = await measurement_service.get_measurements_by_user(
            db, user_id=current_user.id, skip=skip, limit=limit
        )
    
    return [schemas.MeasurementResponse.model_validate(m) for m in measurements]


@app.post("/alerts/", response_model=schemas.AlertResponse)
async def create_alert(
    alert: schemas.AlertCreate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.AlertResponse:
    # Проверяем, что датчик и улей принадлежат пользователю
    sensor = await sensor_service.get_sensor(db, alert.sensor_id, current_user.id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    db_alert = await alert_service.create_alert(db=db, alert=alert, user_id=current_user.id)
    return schemas.AlertResponse.model_validate(db_alert)


@app.get("/alerts/", response_model=List[schemas.AlertResponse])
async def read_alerts(
    hive_id: Optional[int] = None,
    sensor_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.AlertResponse]:
    if sensor_id:
        # Проверяем, что датчик принадлежит пользователю
        sensor = await sensor_service.get_sensor(db, sensor_id, current_user.id)
        if not sensor:
            raise HTTPException(status_code=404, detail="Sensor not found")
        
        alerts = await alert_service.get_alerts_by_sensor(
            db, sensor_id=sensor_id, skip=skip, limit=limit
        )
    else:
        alerts = await alert_service.get_alerts_by_user(
            db, user_id=current_user.id, skip=skip, limit=limit
        )
    
    return [schemas.AlertResponse.model_validate(a) for a in alerts]


@app.put("/alerts/{alert_id}/resolve/", response_model=schemas.AlertResponse)
async def resolve_alert(
    alert_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.AlertResponse:
    alert = await alert_service.resolve_alert(db, alert_id, current_user.id)
    if alert is None:
        raise HTTPException(status_code=404, detail="Alert not found")
    return schemas.AlertResponse.model_validate(alert)


@app.delete("/sensors/{sensor_id}", status_code=status.HTTP_204_NO_CONTENT)
@app.delete("/sensors/{sensor_id}/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_sensor(
    sensor_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
):
    sensor = await sensor_service.get_sensor(db, sensor_id, current_user.id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    await db.delete(sensor)
    await db.commit()
    return None