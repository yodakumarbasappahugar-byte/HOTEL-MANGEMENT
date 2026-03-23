# Hotel Management System — Project Document

> **Project Start Date**: 2026-03-23
> **Stack**: Next.js (Vercel) + FastAPI (Render) + PostgreSQL (Neon)

---

## Steps Finalized

### Step 1: Project Initialization ✅
**Date**: 2026-03-23

- Created project folder structure:
  - `db/` — Database schemas, migrations, seed data
  - `backend/` — FastAPI application (Python)
  - `frontend/` — Next.js application (HTML/CSS focused)
- Created this project tracking document
- **Tokens configured**: GitHub, Vercel, Neon (Render token pending)

#### Decisions Made:
- Frontend will use **vanilla HTML/CSS** wherever possible inside Next.js
- Database will have 6 core tables: `users`, `rooms`, `guests`, `bookings`, `payments`, `staff`
- Backend will use **FastAPI** with **SQLAlchemy** + **asyncpg** for async PostgreSQL support
- No Tailwind CSS — all styling is vanilla CSS

---

### Step 2: Neon Database Connection Test ✅
**Date**: 2026-03-23

- Tested Neon API connectivity using API key
- **Project found**: `hotel mangement` (ID: `misty-frost-77876013`, Region: `aws-us-east-1`)
- **Branch**: `production` (ID: `br-billowing-lab-ada5dr20`)
- **Database**: `neondb` (owner: `neondb_owner`)
- **Host**: `ep-soft-star-ade2wedr-pooler.c-2.us-east-1.aws.neon.tech`
- Connection URI successfully retrieved with SSL enabled

#### Test Scripts:
- `db/test_neon_connection.py` — API connectivity test
- `db/test_neon_details.py` — Database details & connection URI retrieval

---

*More steps will be added below as we finalize each phase.*
