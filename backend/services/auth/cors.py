from fastapi.middleware.cors import CORSMiddleware
import os
import logging

logger = logging.getLogger(__name__)

def setup_cors(app):
    """Настройка CORS для Auth сервиса"""
    
    # Список разрешенных origins
    allowed_origins = [
        "http://localhost:3000",
        "http://127.0.0.1:3000", 
        "http://0.0.0.0:3000",
        "http://localhost:5173",  # Vite default port
        "http://127.0.0.1:5173",
    ]
    
    # В режиме разработки добавляем дополнительные варианты
    if os.getenv("DEBUG", "false").lower() == "true":
        allowed_origins.extend([
            "http://localhost:4173",  # Vite preview
            "http://127.0.0.1:4173",
            "http://0.0.0.0:3000",
        ])
        # НЕ используем "*" для избежания CORS проблем с credentials
    
    logger.info(f"🔧 Auth Service: Setting up CORS with origins: {allowed_origins}")
    
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
    
    logger.info("✅ Auth Service: CORS configuration completed")