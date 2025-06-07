FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY shared/ /app/shared/
COPY services/hive/ /app/services/hive/
COPY services/auth/ /app/services/auth/

# ИСПРАВЛЕНИЕ: Указываем правильный путь к модулю
CMD ["uvicorn", "services.hive.main:app", "--host", "0.0.0.0", "--port", "8000"]