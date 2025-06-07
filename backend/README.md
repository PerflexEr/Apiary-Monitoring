# Apiary Monitoring System

A microservices-based system for monitoring beehives using IoT sensors. The system helps beekeepers track the health and conditions of their hives in real-time.

## Services

The system consists of the following microservices:

1. **Auth Service** - Handles user authentication and authorization
2. **Hive Service** - Manages hive information and manual inspections
3. **Monitoring Service** - Processes sensor data and alerts
4. **Notification Service** - Manages notification preferences and delivery

## Technology Stack

- Python 3.11
- FastAPI
- PostgreSQL
- Redis
- Docker & Docker Compose
- SQLAlchemy (Async)
- Pydantic
- Alembic

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd apiary-monitoring
```

2. Create a `.env` file with the following variables:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=apiary
POSTGRES_PORT=5433
REDIS_PORT=6379
SECRET_KEY=your_secret_key
```

3. Start the services:
```bash
docker compose up -d
```

4. Run database migrations:
```bash
docker compose exec hive_service alembic upgrade head
docker compose exec monitoring_service alembic upgrade head
docker compose exec notification_service alembic upgrade head
```

## API Documentation

Each service exposes its own Swagger documentation:

- Auth Service: http://localhost:8000/docs
- Hive Service: http://localhost:8001/docs
- Monitoring Service: http://localhost:8002/docs
- Notification Service: http://localhost:8003/docs

## Environment Configuration

The system supports different environment configurations:

1. Development:
```bash
cp .env.example .env.dev
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

2. Production:
```bash
cp .env.example .env.prod
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## Development

1. Install development dependencies:
```bash
pip install -r requirements-dev.txt
```

2. Run tests:
```bash
pytest
```

3. Format code:
```bash
black .
isort .
```

## API Overview

### Auth Service
- User registration and authentication
- JWT token management
- User profile management

### Hive Service
- Hive CRUD operations
- Manual inspection records
- Hive statistics

### Monitoring Service
- Sensor management
- Real-time measurements
- Alert configuration and monitoring

### Notification Service
- Notification templates
- User notification preferences
- Multi-channel notifications (email, push)

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 