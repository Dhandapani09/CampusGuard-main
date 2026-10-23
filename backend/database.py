import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import make_url

# Use DATABASE_URL from ECS or Docker environment variables.
# Fall back to the RDS URL only if DATABASE_URL is not configured.
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL",    "postgresql+psycopg2://postgres:shabarish8945@campusguard-db.c7qussw8qzc5.ap-south-1.rds.amazonaws.com:5432/mydatabase?sslmode=require"
)

# Print safe connection details. Do not print the full URL/password.
print(
    "DEBUG: DATABASE_URL source:",
    "environment variable" if os.getenv("DATABASE_URL") else "fallback URL",
    flush=True,
)

url = make_url(SQLALCHEMY_DATABASE_URL)
print("DEBUG: Database driver:", url.drivername, flush=True)
print("DEBUG: Database host:", url.host, flush=True)
print("DEBUG: Database port:", url.port, flush=True)
print("DEBUG: Database name:", url.database, flush=True)
print("DEBUG: Database username:", url.username, flush=True)
print("DEBUG: SSL mode:", url.query.get("sslmode"), flush=True)

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 10},
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Test the database connection when this module is imported.
try:
    with engine.connect() as connection:
        connection.exec_driver_sql("SELECT 1")
    print("DEBUG: RDS database connection SUCCESS", flush=True)
except Exception as e:
    print("DEBUG: RDS database connection FAILED", flush=True)
    print("DEBUG: Error type:", type(e).__name__, flush=True)
    print("DEBUG: Error details:", str(e), flush=True)
