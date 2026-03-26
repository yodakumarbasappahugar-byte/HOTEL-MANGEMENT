import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import os

DATABASE_URL = "postgresql+asyncpg://neondb_owner:npg_ZP3QMOzNCoa1@ep-soft-star-ade2wedr-pooler.c-2.us-east-1.aws.neon.tech/HOTEL%20MANGEMENT?sslmode=require"

async def check_db():
    engine = create_async_engine(DATABASE_URL)
    AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with AsyncSessionLocal() as session:
        try:
            # Check users
            result = await session.execute(text("SELECT count(*) FROM users"))
            user_count = result.scalar()
            print(f"Users count: {user_count}")
            
            # Check rooms
            result = await session.execute(text("SELECT count(*) FROM rooms"))
            room_count = result.scalar()
            print(f"Rooms count: {room_count}")
            
        except Exception as e:
            print(f"Error checking database: {e}")
        finally:
            await engine.dispose()

if __name__ == "__main__":
    asyncio.run(check_db())
