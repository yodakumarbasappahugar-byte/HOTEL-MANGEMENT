import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String, DateTime, text, select

Base = declarative_base()

class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    room_type = Column(String(50))
    price_per_night = Column(Integer)
    description = Column(String(500))
    image_url = Column(String(255))
    is_available = Column(String(20))

async def check_rooms():
    url = "postgresql+asyncpg://neondb_owner:npg_ZP3QMOzNCoa1@ep-soft-star-ade2wedr-pooler.c-2.us-east-1.aws.neon.tech/neondb"
    engine = create_async_engine(url, connect_args={"ssl": True})
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        try:
            result = await session.execute(text("SELECT * FROM rooms"))
            rooms = result.fetchall()
            print(f"Room count: {len(rooms)}")
            for r in rooms:
                print(r)
        except Exception as e:
            print(f"DATABASE QUERY FAILED: {str(e)}")

if __name__ == "__main__":
    asyncio.run(check_rooms())
