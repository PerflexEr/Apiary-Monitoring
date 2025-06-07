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
        
        if method == "OPTIONS":
            # Предварительные запросы CORS
            response = Response(status_code=200)
        else:
            response = await call_next(request)
        
        # Определяем правильный origin для ответа
        if origin:
            if any(origin.startswith(allowed.replace('*', '')) for allowed in self.allowed_origins if '*' in allowed) or origin in self.allowed_origins:
                response.headers["Access-Control-Allow-Origin"] = origin
            else:
                # Если origin не разрешен, используем первый разрешенный
                response.headers["Access-Control-Allow-Origin"] = self.allowed_origins[0]
        else:
            # Если origin не указан, используем первый разрешенный
            response.headers["Access-Control-Allow-Origin"] = self.allowed_origins[0]
            
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type, Accept, Origin, X-Requested-With"
        response.headers["Access-Control-Expose-Headers"] = "Content-Length, Content-Range"
        response.headers["Access-Control-Max-Age"] = "3600"
        
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
        "http://0.0.0.0:5173",
        "*"  # Разрешаем все origins в режиме разработки
    ]
    
    # Добавляем стандартный CORS middleware первым
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )
    
    # Добавляем middleware для отладки CORS после основного
    app.add_middleware(CORSDebugMiddleware, allowed_origins=allowed_origins)