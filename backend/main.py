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

# Database configuration
# Convert to asyncpg if needed, or use the provided string directly with a compatible driver
# The user provided: postgresql://neondb_owner:npg_ZP3QMOzNCoa1@ep-soft-star-ade2wedr-pooler.c-2.us-east-1.aws.neon.tech/HOTEL%20MANGEMENT?sslmode=require&channel_binding=require
DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql+asyncpg://neondb_owner:npg_ZP3QMOzNCoa1@ep-soft-star-ade2wedr-pooler.c-2.us-east-1.aws.neon.tech/HOTEL%20MANGEMENT?sslmode=require")

engine = create_async_engine(DATABASE_URL, echo=True)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get DB session
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session

@app.get("/")
async def root():
    return {"message": "Ayodhdya Hotel API is running"}

@app.post("/api/signup", response_model=UserResponse)
async def signup(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if email already exists
    from sqlalchemy import select
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    new_user = User(
        username=user_data.name,
        email=user_data.email,
        password_hash=pwd_context.hash(user_data.password)
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
    
    if not user or not pwd_context.verify(user_data.password, user.password_hash):
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
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
