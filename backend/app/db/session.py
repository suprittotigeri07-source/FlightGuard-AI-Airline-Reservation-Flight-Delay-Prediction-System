from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

db_url = settings.DATABASE_URL
if db_url.startswith("postgresql://"):
    # Use pure-python pg8000 dialect to avoid Windows C-extension DLL policy blocks
    db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

# Determine database engine parameters based on URL
connect_args = {}
if db_url.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(
    db_url,
    connect_args=connect_args,
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
