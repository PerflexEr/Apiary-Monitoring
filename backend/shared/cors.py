from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from starlette.responses import JSONResponse

def setup_cors(app: FastAPI):
    # Добавляем CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  # Разрешаем запросы с фронтенда
        allow_credentials=True,  # Разрешаем передачу credentials (cookies, authorization headers)
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Разрешаем конкретные методы
        allow_headers=["*"],  # Разрешаем все заголовки
        expose_headers=["*"],  # Разрешаем доступ ко всем заголовкам в ответе
        max_age=3600,  # Кэшируем preflight запросы на 1 час
    )

    # Добавляем обработчик OPTIONS запросов
    @app.options("/{full_path:path}")
    async def options_handler(full_path: str):
        return JSONResponse(
            content={},
            headers={
                "Access-Control-Allow-Origin": "http://localhost:3000",
                "Access-Control-Allow-Methods": "*",
                "Access-Control-Allow-Headers": "*",
                "Access-Control-Allow-Credentials": "true",
            },
        ) 