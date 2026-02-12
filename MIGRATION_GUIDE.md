# Migration Guide: SQLite to PostgreSQL

This guide details the steps to migrate an existing installation of the POS system from SQLite to PostgreSQL.

## 1. Prerequisites (Target System)

Before starting, ensure the target system has:
1.  **PostgreSQL Installed**: Download and install from [postgresql.org](https://www.postgresql.org/download/).
2.  **Database User**: Create a user (or use default `postgres`) with a known password.
3.  **Database Created**: Create an empty database named `rebill_db`.

```sql
-- Run in psql or pgAdmin
CREATE DATABASE rebill_db;
-- If using a specific user other than postgres
CREATE USER myuser WITH PASSWORD 'mypassword';
GRANT ALL PRIVILEGES ON DATABASE rebill_db TO myuser;
```

## 2. Update Codebase

Pull the latest code changes to the target system. This should include:
- Refactored `backend/` with SQLAlchemy models.
- New `requirements.txt`.
- Migration scripts (`migrate_sqlite_to_postgres.py`, `verify_migration.py`).

## 3. Environment Setup

1.  **Install Python Dependencies**:
    ```bash
    cd backend
    pip install -r requirements.txt
    ```

2.  **Configure Database Connection**:
    - Rename `backend/.env.example` to `backend/.env`.
    - Edit `backend/.env` and update the `DATABASE_URL` with the target system's credentials.
    
    ```properties
    # .env
    DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/rebill_db
    ```

    *Note: If you don't use `.env`, the system defaults to `postgresql://postgres:dharmik@localhost:5432/rebill_db` in `config.py`.*

## 4. Perform Data Migration

Run the migration script to transfer data from the existing SQLite file (`backend/data/products.db`) to the new PostgreSQL database.

```bash
cd backend
python migrate_sqlite_to_postgres.py
```

**What this does:**
- Creates all necessary tables in PostgreSQL.
- Reads data from the local SQLite file.
- Inserts Products, Categories, Bills, and Settings into PostgreSQL.
- Preserves original IDs and timestamps.

## 5. Verification

Run the verification script to ensure data counts match.

```bash
python verify_migration.py
```

Output should show counts for Products, Bills, etc., and confirm the database is populated.

## 6. Run the Application

Start the backend as usual. It will now connect to PostgreSQL automatically.

```bash
python app.py
```
