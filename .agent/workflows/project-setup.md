---
description: Hotel Management - Project Setup and Configuration
---

# Hotel Management - Project Setup Skill

## Project Overview
- **Frontend**: Next.js deployed on Vercel (HTML/CSS focused, no Tailwind)
- **Backend**: FastAPI deployed on Render
- **Database**: PostgreSQL on Neon

## Project Directory
```
c:\Users\Student\Desktop\HOTEL MANGEMENT\
├── db/          # Database schemas, migrations, seeds
├── backend/     # FastAPI application
├── frontend/    # Next.js application
└── PROJECT_DOCUMENT.md  # Step-by-step progress tracker
```

## Tokens
- **GitHub**: Token name `hotel mangement`, value stored in `TOKENS` file
- **Vercel**: Token stored in `TOKENS` file
- **Neon**: Token stored in `TOKENS` file
- **Render**: Token pending

## Key Decisions
1. Use **vanilla CSS** instead of Tailwind for all frontend styling
2. Use **HTML/CSS** as much as possible inside Next.js
3. Database tables: `users`, `rooms`, `guests`, `bookings`, `payments`, `staff`
4. Backend uses SQLAlchemy + asyncpg for async PostgreSQL
5. JWT-based authentication

## Next Steps
After setup, proceed to Phase 2 (Database) → Phase 3 (Backend) → Phase 4 (Frontend) → Phase 5 (Deploy).
