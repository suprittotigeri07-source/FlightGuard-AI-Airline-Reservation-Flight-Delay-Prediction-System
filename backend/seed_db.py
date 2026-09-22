import sys
import os

# Add backend directory to python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine, SessionLocal
from app.db.base import Base
from app.db.seed import seed_database

def init_and_seed():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        print("Seeding database with airports, airlines, aircraft, scheduled flights, and ML delay predictions...")
        seed_database(db)
        print("Database seeding completed successfully!")
    finally:
        db.close()

if __name__ == "__main__":
    init_and_seed()
