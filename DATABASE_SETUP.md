# Database Setup Instructions

## 1. Install PostgreSQL
- On macOS: `brew install postgresql`
- On Linux: Use your package manager (e.g., `sudo apt install postgresql`)
- On Windows: Download from [postgresql.org](https://www.postgresql.org/download/)

## 2. Start PostgreSQL Service
```bash
# macOS (Homebrew)
brew services start postgresql

# Linux (systemd)
sudo systemctl start postgresql
```

## 3. Create Database and User with Proper Permissions
```bash
# Access psql as superuser
sudo -u postgres psql

# In psql shell:
CREATE DATABASE checklist;
CREATE USER checklist_user WITH PASSWORD 'securepassword';

# Grant database-level privileges
GRANT ALL PRIVILEGES ON DATABASE checklist TO checklist_user;

# Connect to the checklist database to set schema permissions
\c checklist

# Grant schema-specific permissions - CRITICAL for proper functionality
GRANT USAGE ON SCHEMA public TO checklist_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO checklist_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO checklist_user;

# Set default privileges for future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO checklist_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO checklist_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO checklist_user;

# Make checklist_user the owner of the public schema
ALTER SCHEMA public OWNER TO checklist_user;

\q
```

## 4. Update .env File
Create or update your `.env` file in the project root directory:
```env
# Development environment settings
DATABASE_URL="postgresql://checklist_user:securepassword@localhost:5432/checklist?schema=public"
NODE_ENV=development
```

## 5. Run Migrations
```bash
npx prisma migrate dev --name init
npx prisma generate
```

## 6. Verify Connection
```bash
npx prisma migrate status
```

## 7. Troubleshooting Database Connection Issues

### Permission Denied Errors
If you encounter permission errors like:
```
User `checklist_user` was denied access on the database `checklist.public`
```

Follow these steps:

1. Verify the user exists:
```sql
SELECT * FROM pg_user WHERE usename = 'checklist_user';
```

2. Check user's permissions on the database:
```sql
\c checklist
\dn+
```

3. Reconnect to database as the checklist_user:
```bash
psql -U checklist_user -d checklist
```

4. Test permissions by listing tables:
```sql
\dt
SELECT * FROM pg_tables WHERE schemaname = 'public';
```

### Connection String Format
Ensure your DATABASE_URL follows this exact format:
```
postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

For local development:
```
postgresql://checklist_user:securepassword@localhost:5432/checklist?schema=public
```

### Special Characters in Password
If your password contains special characters, make sure to URL-encode them in the connection string.

## 8. Testing Environment Setup

For testing, create a separate test database:

```bash
# In psql
CREATE DATABASE checklist_test;
GRANT ALL PRIVILEGES ON DATABASE checklist_test TO checklist_user;

# Connect to the test database
\c checklist_test

# Set schema permissions
GRANT USAGE ON SCHEMA public TO checklist_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO checklist_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO checklist_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO checklist_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO checklist_user;
ALTER SCHEMA public OWNER TO checklist_user;
```

Create a `.env.test` file for your test environment:
```env
DATABASE_URL="postgresql://checklist_user:securepassword@localhost:5432/checklist_test?schema=public"
NODE_ENV=test
```

## 9. Common PostgreSQL Commands

- Start PostgreSQL: `pg_ctl start`
- Stop PostgreSQL: `pg_ctl stop`
- Check if PostgreSQL is running: `pg_isready`
- Access PostgreSQL: `psql -U username -d database_name`
- List all databases: `\l` (in psql)
- List all tables: `\dt` (in psql)
- List all users: `\du` (in psql)
- Export database: `pg_dump -U username database_name > backup.sql`
- Import database: `psql -U username database_name < backup.sql`