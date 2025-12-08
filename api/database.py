"""
Database configuration and session management
"""
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# SQLite database URL for local development
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./smartreach.db")

# Create engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

# Create session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db():
    """
    Dependency function to get database session
    Use with FastAPI Depends()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database - create all tables
    Also handles migrations for schema changes
    """
    Base.metadata.create_all(bind=engine)
    
    # Migration: Add 'angle' column to campaigns table if it doesn't exist
    # This handles the case where the database was created before the angle field was added
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            # Check if angle column exists (SQLite specific)
            if "sqlite" in DATABASE_URL:
                result = conn.execute(text("""
                    SELECT COUNT(*) FROM pragma_table_info('campaigns') 
                    WHERE name='angle'
                """))
                if result.scalar() == 0:
                    # Column doesn't exist, add it
                    conn.execute(text("ALTER TABLE campaigns ADD COLUMN angle TEXT"))
                    conn.commit()
                    print("[DATABASE] Added 'angle' column to campaigns table")
    except Exception as e:
        # If migration fails, continue anyway (column might already exist or table doesn't exist yet)
        print(f"[DATABASE] Migration note: {e}")

