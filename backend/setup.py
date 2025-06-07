from setuptools import setup, find_packages

setup(
    name="apiary-backend",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "fastapi",
        "uvicorn",
        "sqlalchemy",
        "pydantic",
        "alembic",
        "psycopg2-binary",
        "python-jose",
        "passlib",
        "python-multipart",
        "redis",
    ],
) 