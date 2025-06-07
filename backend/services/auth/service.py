from typing import Optional
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import logging

from shared.service import BaseService
from . import models, schemas
from .config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
logger = logging.getLogger(__name__)


class UserService(BaseService[models.User]):
    def __init__(self):
        super().__init__(models.User)

    async def get_user(self, db: AsyncSession, user_id: int) -> Optional[models.User]:
        return await self.get(db, user_id)

    async def get_user_by_username(self, db: AsyncSession, username: str) -> Optional[models.User]:
        query = select(self.model).filter(self.model.username == username)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def get_user_by_email(self, db: AsyncSession, email: str) -> Optional[models.User]:
        query = select(self.model).filter(self.model.email == email)
        result = await db.execute(query)
        return result.scalar_one_or_none()

    async def create_user(self, db: AsyncSession, user: schemas.UserCreate) -> models.User:
        hashed_password = self.get_password_hash(user.password)
        db_user = models.User(
            email=user.email,
            username=user.username,
            hashed_password=hashed_password,
            is_active=True,
            is_superuser=False
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    async def authenticate_user(
        self, db: AsyncSession, username: str, password: str
    ) -> Optional[models.User]:
        """
        Аутентификация пользователя по username или email
        
        Args:
            db: Сессия базы данных
            username: Имя пользователя или email
            password: Пароль
            
        Returns:
            Пользователь если аутентификация успешна, иначе None
        """
        logger.info(f"🔐 Attempting to authenticate user: {username}")
        
        # Сначала пытаемся найти по username
        user = await self.get_user_by_username(db, username)
        
        # Если не нашли по username, пытаемся найти по email
        if not user:
            logger.info(f"👤 User not found by username, trying email: {username}")
            user = await self.get_user_by_email(db, username)
        
        if not user:
            logger.warning(f"❌ User not found: {username}")
            return None
            
        if not self.verify_password(password, user.hashed_password):
            logger.warning(f"❌ Invalid password for user: {username}")
            return None
            
        if not user.is_active:
            logger.warning(f"❌ User is not active: {username}")
            return None
            
        logger.info(f"✅ User authenticated successfully: {user.username} (ID: {user.id})")
        return user

    def create_access_token(
        self, data: dict, expires_delta: Optional[timedelta] = None
    ) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=15)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM
        )
        return encoded_jwt

    async def get_current_user(
        self,
        db: AsyncSession,
        token: str,
    ) -> Optional[models.User]:
        try:
            payload = jwt.decode(
                token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
            )
            username: str = payload.get("sub")
            if username is None:
                logger.warning("❌ No username in token payload")
                return None
        except JWTError as e:
            logger.warning(f"❌ JWT decode error: {e}")
            return None
            
        user = await self.get_user_by_username(db, username=username)
        if user is None:
            logger.warning(f"❌ User not found for token: {username}")
            return None
            
        if not user.is_active:
            logger.warning(f"❌ User is not active: {username}")
            return None
            
        return user

    async def update_user(
        self, db: AsyncSession, user_id: int, user_update: schemas.UserUpdate
    ) -> Optional[models.User]:
        update_data = user_update.model_dump(exclude_unset=True)
        if "password" in update_data:
            update_data["hashed_password"] = self.get_password_hash(update_data.pop("password"))
        
        return await super().update(db, user_id, **update_data)