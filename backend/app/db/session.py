import logging
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger(__name__)


def create_db_engine():
    db_url = settings.DATABASE_URL.strip()
    if db_url.startswith("postgres://"):
        db_url = db_url.replace("postgres://", "postgresql://", 1)

    if db_url.startswith("postgresql://") and "+pg8000" not in db_url and "+psycopg2" not in db_url:
        db_url = db_url.replace("postgresql://", "postgresql+pg8000://", 1)

    connect_args = {}
    if db_url.startswith("sqlite"):
        connect_args = {"check_same_thread": False}
    elif "+pg8000" in db_url:
        connect_args = {"timeout": 10}

    try:
        engine = create_engine(
            db_url,
            connect_args=connect_args,
            pool_pre_ping=True
        )
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        print(f"[DB Session] Successfully connected to primary database.")
        return engine
    except Exception as e:
        print(f"[DB Warning] Failed to connect to primary database ({e}). Falling back to SQLite.")
        fallback_url = "sqlite:///./flightguard.db"
        return create_engine(
            fallback_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )


engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

