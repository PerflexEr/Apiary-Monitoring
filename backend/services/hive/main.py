from typing import List
from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from shared.database import get_db
from shared.cors import setup_cors
from services.auth.service import UserService
from services.auth import schemas as auth_schemas
from . import schemas
from .service import HiveService, InspectionService
from .config import SECRET_KEY, ALGORITHM

app = FastAPI(title="Hive Service", version="1.0.0")

# Включаем автоматическое перенаправление слешей
app.router.redirect_slashes = True

# Настраиваем CORS
setup_cors(app)

hive_service = HiveService()
inspection_service = InspectionService()
user_service = UserService()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8001/token")


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
    return {"status": "healthy", "service": "hive"}


@app.post("/hives/", response_model=schemas.HiveResponse)
async def create_hive(
    hive: schemas.HiveCreate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.HiveResponse:
    db_hive = await hive_service.create_hive(db=db, hive=hive, user_id=current_user.id)
    return schemas.HiveResponse.model_validate(db_hive)


@app.get("/hives", response_model=List[schemas.HiveResponse])
@app.get("/hives/", response_model=List[schemas.HiveResponse])
async def read_hives(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.HiveResponse]:
    print(f"Handling GET /hives request for user {current_user.id}")
    hives = await hive_service.get_hives_by_user(
        db, user_id=current_user.id, skip=skip, limit=limit
    )
    print(f"Found {len(hives)} hives for user {current_user.id}")
    return [schemas.HiveResponse.model_validate(hive) for hive in hives]


@app.get("/hives/{hive_id}", response_model=schemas.HiveWithStats)
async def read_hive(
    hive_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.HiveWithStats:
    hive = await hive_service.get_hive_with_stats(db, hive_id, current_user.id)
    if hive is None:
        raise HTTPException(status_code=404, detail="Hive not found")
    return schemas.HiveWithStats.model_validate(hive)


@app.put("/hives/{hive_id}", response_model=schemas.HiveResponse)
async def update_hive(
    hive_id: int,
    hive: schemas.HiveUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.HiveResponse:
    db_hive = await hive_service.get(db, hive_id)
    if db_hive is None:
        raise HTTPException(status_code=404, detail="Hive not found")
    if db_hive.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    updated_hive = await hive_service.update(
        db, hive_id, **hive.model_dump(exclude_unset=True)
    )
    return schemas.HiveResponse.model_validate(updated_hive)


@app.post("/inspections/", response_model=schemas.InspectionResponse)
async def create_inspection(
    inspection: schemas.InspectionCreate,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> schemas.InspectionResponse:
    # Проверяем, что улей принадлежит пользователю
    hive = await hive_service.get(db, inspection.hive_id)
    if not hive or hive.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Hive not found")
    
    db_inspection = await inspection_service.create_inspection(
        db=db, inspection=inspection, user_id=current_user.id
    )
    return schemas.InspectionResponse.model_validate(db_inspection)


@app.get("/hives/{hive_id}/inspections/", response_model=List[schemas.InspectionResponse])
async def read_inspections(
    hive_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> List[schemas.InspectionResponse]:
    # Проверяем, что улей принадлежит пользователю
    hive = await hive_service.get(db, hive_id)
    if not hive or hive.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Hive not found")
    
    inspections = await inspection_service.get_inspections_by_hive(
        db, hive_id=hive_id, user_id=current_user.id, skip=skip, limit=limit
    )
    return [schemas.InspectionResponse.model_validate(inspection) for inspection in inspections]


@app.delete("/hives/{hive_id}", response_model=dict)
async def delete_hive(
    hive_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: auth_schemas.User = Depends(get_current_active_user)
) -> dict:
    db_hive = await hive_service.get(db, hive_id)
    if db_hive is None:
        raise HTTPException(status_code=404, detail="Hive not found")
    if db_hive.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    await hive_service.delete(db, hive_id)
    return {"status": "success", "message": "Hive deleted successfully"}