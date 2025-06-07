from sqlalchemy import Column, Integer, Float, ForeignKey, String, Boolean
from sqlalchemy.orm import relationship
from shared.database import Base, TimestampMixin


class Sensor(Base, TimestampMixin):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    hive_id = Column(Integer, ForeignKey("hives.id", name="fk_sensors_hive_id", ondelete="CASCADE"))
    name = Column(String)
    sensor_type = Column(String)  # temperature, humidity, weight, etc.
    is_active = Column(Boolean, default=True)
    user_id = Column(Integer, ForeignKey("users.id", name="fk_sensors_user_id"))

    # Relationships
    measurements = relationship("Measurement", back_populates="sensor")


class Measurement(Base, TimestampMixin):
    __tablename__ = "measurements"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id", name="fk_measurements_sensor_id"))
    value = Column(Float)
    battery_level = Column(Float)  # Уровень заряда батареи датчика в процентах

    # Relationships
    sensor = relationship("Sensor", back_populates="measurements")


class Alert(Base, TimestampMixin):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id", name="fk_alerts_sensor_id"))
    hive_id = Column(Integer, ForeignKey("hives.id", name="fk_alerts_hive_id"))
    alert_type = Column(String)  # temperature_high, humidity_low, etc.
    message = Column(String)
    is_resolved = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id", name="fk_alerts_user_id"))