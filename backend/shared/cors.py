from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from starlette.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response
import logging

logger = logging.getLogger(__name__)

class CORSDebugMiddleware(BaseHTTPMiddleware):
    """Middleware для отладки CORS запросов"""
    
    def __init__(self, app, allowed_origins):
        super().__init__(app)
        self.allowed_origins = allowed_origins
    
    async def dispatch(self, request: Request, call_next):
        origin = request.headers.get("origin")
        method = request.method
        logger.info(f"🌐 CORS Debug: {method} {request.url} from origin: {origin}")
        
        response = await call_next(request)
        
        # Определяем правильный origin для ответа
        if origin and (origin in self.allowed_origins or any(origin.startswith(allowed.replace('*', '')) for allowed in self.allowed_origins if '*' in allowed)):
            response.headers["Access-Control-Allow-Origin"] = origin
        elif not origin:
            # Если origin не указан, используем первый разрешенный
            response.headers["Access-Control-Allow-Origin"] = self.allowed_origins[0] if self.allowed_origins else "*"
        else:
            # Используем первый разрешенный origin как fallback
            response.headers["Access-Control-Allow-Origin"] = self.allowed_origins[0] if self.allowed_origins else "*"
            
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "*"
        response.headers["Access-Control-Expose-Headers"] = "*"
        
        logger.info(f"✅ CORS Response: {response.status_code} with origin: {response.headers.get('Access-Control-Allow-Origin')}")
        return response

def setup_cors(app: FastAPI):
    """Настройка CORS для FastAPI приложения"""
    
    # Список разрешенных origins
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://0.0.0.0:3000",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
    ]
    
    # В режиме разработки добавляем дополнительные localhost варианты
    import os
    if os.getenv("DEBUG", "false").lower() == "true":
        allowed_origins.extend([
            "http://localhost:4173",  # Vite preview
            "http://127.0.0.1:4173",
            "http://0.0.0.0:3000",
        ])
        # НЕ используем "*" когда withCredentials = true
    
    logger.info(f"🔧 Setting up CORS with origins: {allowed_origins}")
    
    # Добавляем основной CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
        allow_headers=[
            "Accept",
            "Accept-Language", 
            "Content-Language",
            "Content-Type",
            "Authorization",
            "X-Requested-With",
            "X-CSRF-Token",
            "Cache-Control",
        ],
        expose_headers=["*"],
        max_age=3600,
    )
    
    # Добавляем debug middleware в режиме разработки
    if os.getenv("DEBUG", "false").lower() == "true":
        app.add_middleware(CORSDebugMiddleware, allowed_origins=allowed_origins)
    
    # Глобальный обработчик OPTIONS запросов
    @app.options("/{full_path:path}")
    async def options_handler(request: Request, full_path: str):
        origin = request.headers.get("origin")
        
        logger.info(f"🔄 OPTIONS request for {full_path} from {origin}")
        
        # Определяем правильный origin для ответа
        allowed_origin = origin if origin and origin in allowed_origins else (allowed_origins[0] if allowed_origins else "http://localhost:3000")
        
        headers = {
            "Access-Control-Allow-Origin": allowed_origin,
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD",
            "Access-Control-Allow-Headers": "*",
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Max-Age": "3600",
        }
        
        return JSONResponse(
            content={"message": "OK"},
            headers=headers,
            status_code=200
        )
    
    # Обработчик для корневого пути с информацией о сервисе
    @app.get("/health")
    async def health_check():
        return {
            "status": "healthy",
            "cors": "enabled",
            "timestamp": __import__("datetime").datetime.utcnow().isoformat()
        }
    
    logger.info("✅ CORS configuration completed")