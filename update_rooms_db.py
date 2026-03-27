import asyncio
import os
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

async def update_rooms():
    # Use the same connection logic as main.py
    url = "postgresql+asyncpg://neondb_owner:npg_ZP3QMOzNCoa1@ep-soft-star-ade2wedr.c-2.us-east-1.aws.neon.tech/neondb"
    
    engine = create_async_engine(url, connect_args={"ssl": True})
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        # Clear existing rooms to avoid conflicts if they were seeded differently
        await session.execute(text("DELETE FROM rooms"))
        
        rooms = [
            Room(
                name="Luxury Sunset Suite",
                room_type="Luxury Suite",
                price_per_night=1200,
                description="Ultra-luxury suite with floor-to-ceiling windows and panoramic city views.",
                image_url="/images/rooms/luxury.png"
            ),
            Room(
                name="Deluxe Ocean View",
                room_type="Deluxe Room",
                price_per_night=650,
                description="Contemporary room with a private balcony and stunning ocean vistas.",
                image_url="/images/rooms/deluxe.png"
            ),
            Room(
                name="Royal Presidential Suite",
                room_type="Presidential Suite",
                price_per_night=2500,
                description="Grandest suite with private infinity pool and opulent marble finishings.",
                image_url="/images/rooms/royal.png"
            )
        ]
        session.add_all(rooms)
        await session.commit()
        print("Rooms updated with new images successfully!")

if __name__ == "__main__":
    asyncio.run(update_rooms())
