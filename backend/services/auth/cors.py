from fastapi.middleware.cors import CORSMiddleware

def setup_cors(app):
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],  # Разрешаем запросы с фронтенда
        allow_credentials=True,  # Разрешаем передачу credentials (cookies, authorization headers)
        allow_methods=["*"],  # Разрешаем все HTTP методы
        allow_headers=["*"],  # Разрешаем все заголовки
    ) 