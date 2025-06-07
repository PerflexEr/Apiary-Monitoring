FROM python:3.11-slim

WORKDIR /app

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY setup.py .
COPY alembic.ini .
COPY migrations/ /app/migrations/
COPY shared/ /app/shared/
COPY services/ /app/services/

RUN pip install -e .

CMD ["uvicorn", "services.auth.main:app", "--host", "0.0.0.0", "--port", "8000"]