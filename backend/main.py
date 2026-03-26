from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, DateTime, text
from passlib.context import CryptContext
import logging
import urllib.parse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Database configuration (initialized lazily or in startup)
engine = None
AsyncSessionLocal = None
Base = declarative_base()

def get_engine():
    global engine
    if engine is None:
        # The user provided DATABASE_URL might be overridden by Render
        url = os.environ.get("DATABASE_URL")
        if not url:
            url = "postgresql+asyncpg://neondb_owner:npg_ZP3QMOzNCoa1@ep-soft-star-ade2wedr.c-2.us-east-1.aws.neon.tech/neondb"
        
        # Ensure it uses asyncpg
        if url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
            
        # Strip all query parameters and handle them in connect_args
        if "?" in url:
            url = url.split("?")[0]
            
        # Force neondb if it has spaces or %20 to avoid driver issues
        if "HOTEL" in url or "%20" in url:
            # Reconstruct to use neondb instead of the one with spaces
            if "@" in url:
                head, _ = url.rsplit("/", 1)
                url = head + "/neondb"
            
        sanitized_url = url.split("@")[-1] if "@" in url else "HIDDEN"
        logger.info(f"Creating engine for {sanitized_url}")
        
        engine = create_async_engine(
            url, 
            echo=True,
            pool_size=5,
            max_overflow=10,
            pool_timeout=30,
            pool_recycle=1800,
            pool_pre_ping=True,
            connect_args={
                "server_settings": {"statement_timeout": "45000"},
                "ssl": True # Explicitly handle SSL for Neon
            } 
        )
    return engine

def get_sessionmaker():
    global AsyncSessionLocal
    if AsyncSessionLocal is None:
        AsyncSessionLocal = sessionmaker(get_engine(), class_=AsyncSession, expire_on_commit=False)
    return AsyncSessionLocal

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto", bcrypt__rounds=10)

# Models
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    room_type = Column(String(50), nullable=False)
    price_per_night = Column(Integer, nullable=False)
    description = Column(String(500))
    image_url = Column(String(255))
    is_available = Column(String(20), default="Available")
    created_at = Column(DateTime, default=datetime.utcnow)

# Pydantic Schemas
class UserCreate(BaseModel):
    name: str  # We'll use this as username
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    created_at: datetime

    class Config:
        from_attributes = True

class RoomResponse(BaseModel):
    id: int
    name: str
    room_type: str
    price_per_night: int
    description: str
    image_url: str
    is_available: str

    class Config:
        from_attributes = True

app = FastAPI(title="Ayodhdya Hotel API")

# Explicitly allow the user's Vercel frontend origin
ALLOWED_ORIGINS = [
    "https://frontend-two-mocha-43.vercel.app",
    "https://hotel-management-backend-2xln.onrender.com",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Keep * for now to be safe, but we will also use a custom handler
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom logging middleware to see what's happening on Render
@app.middleware("http")
async def log_requests(request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    # Force CORS headers on every response just in case
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"GLOBAL ERROR: {str(exc)}")
    from fastapi.responses import JSONResponse
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error", "detail": str(exc)},
        headers={"Access-Control-Allow-Origin": "*"}
    )

# Dependency to get DB session
async def get_db():
    session_factory = get_sessionmaker()
    async with session_factory() as session:
        yield session

@app.get("/api/ping")
async def ping():
    return {"status": "alive", "timestamp": datetime.utcnow()}

@app.get("/")
async def root():
    return {"message": "Ayodhdya Hotel API is running"}

@app.get("/api/health")
async def health():
    return {"status": "ok", "message": "Backend is reachable (CORS Test)"}

@app.get("/api/db-test")
async def db_test(db: AsyncSession = Depends(get_db)):
    try:
        import asyncio
        async with asyncio.timeout(5):
            await db.execute(text("SELECT 1"))
        return {"status": "connected", "message": "Database is reachable"}
    except Exception as e:
        logger.error(f"DB TEST FAILED: {str(e)}")
        return {"status": "error", "message": str(e)}

@app.post("/api/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    # Hash password (bcrypt has a 72-byte limit)
    pwd_to_hash = user_data.password[:72] if len(user_data.password) > 72 else user_data.password
    hashed_password = pwd_context.hash(pwd_to_hash)
    new_user = User(
        username=user_data.name,
        email=user_data.email,
        password_hash=hashed_password
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@app.post("/api/signin")
async def signin(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalars().first()
    
    # Truncate password to 72 bytes for bcrypt compatibility
    pwd_to_verify = user_data.password[:72] if len(user_data.password) > 72 else user_data.password
    
    if not user or not pwd_context.verify(pwd_to_verify, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "message": "Login successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email
        }
    }

@app.get("/api/status")
async def api_status():
    return {
        "service": "Ayodhdya Hotel Backend",
        "status": "online",
        "database": "connected"
    }

@app.get("/api/rooms", response_model=List[RoomResponse])
async def get_rooms(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    result = await db.execute(select(Room))
    return result.scalars().all()

@app.get("/api/users", response_model=List[UserResponse])
async def get_users(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    result = await db.execute(select(User))
    return result.scalars().all()

@app.get("/api/db-stats")
async def get_db_stats(db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select, func
    user_result = await db.execute(select(func.count(User.id)))
    room_result = await db.execute(select(func.count(Room.id)))
    return {
        "users": user_result.scalar(),
        "rooms": room_result.scalar(),
        "last_updated": datetime.utcnow()
    }

@app.post("/api/rooms/seed")
async def seed_rooms(db: AsyncSession = Depends(get_db)):
    # Check if rooms already exist
    from sqlalchemy import select
    result = await db.execute(select(Room))
    if result.scalars().first():
        return {"message": "Rooms already seeded"}
    
    rooms = [
        Room(
            name="Luxury Sunset Suite",
            room_type="Luxury Suite",
            price_per_night=1200,
            description="Ultra-luxury suite with floor-to-ceiling windows and panoramic city views.",
            image_url="/images/suite_luxury.png"
        ),
        Room(
            name="Deluxe Ocean View",
            room_type="Deluxe Room",
            price_per_night=650,
            description="Contemporary room with a private balcony and stunning ocean vistas.",
            image_url="/images/suite_deluxe.png"
        ),
        Room(
            name="Royal Presidential Suite",
            room_type="Presidential Suite",
            price_per_night=2500,
            description="Grandest suite with private infinity pool and opulent marble finishings.",
            image_url="/images/suite_presidential.png"
        )
    ]
    db.add_all(rooms)
    await db.commit()
    return {"message": "Rooms seeded successfully"}

# Table creation (utility)
@app.on_event("startup")
async def startup():
    logger.info("Application starting up...")
    try:
        # Initialize engine and sessionmaker
        current_engine = get_engine()
        # Use a timeout for the startup connection to avoid hanging the entire app
        import asyncio
        try:
            async with asyncio.timeout(10): # 10s timeout
                async with current_engine.begin() as conn:
                    logger.info("Successfully connected to database. Creating tables if they don't exist...")
                    await conn.run_sync(Base.metadata.create_all)
                    logger.info("Tables created/verified successfully.")
        except asyncio.TimeoutError:
            logger.error("STARTUP TIMEOUT: Database connection took too long (>10s).")
    except Exception as e:
        logger.error(f"STARTUP ERROR: Failed to connect to database or create tables: {str(e)}")
        logger.warning("Application is starting with a FAILED database connection. Check /api/status for details.")
