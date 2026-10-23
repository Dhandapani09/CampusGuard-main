import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Use DATABASE_URL from ECS or Docker environment variables.
# Fall back to the RDS URL only if DATABASE_URL is not configured.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",    "postgresql+psycopg2://postgres:shabarish8945@campusguard-db.c7qussw8qzc5.ap-south-1.rds.amazonaws.com:5432/mydatabase?sslmode=require"
)

# DEBUG LOGS
print("=" * 80)
print("DATABASE_URL from environment:")
print(os.getenv("DATABASE_URL"))
print("=" * 80)

print("SQLALCHEMY_DATABASE_URL being used:")
print(SQLALCHEMY_DATABASE_URL)
print("=" * 80)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
