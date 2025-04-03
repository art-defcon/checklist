# Database Verification and Troubleshooting Guide

This document provides detailed instructions for verifying and troubleshooting database connections for the Checklist application.

## Table of Contents

1. [Quick Verification](#quick-verification)
2. [Connection Troubleshooting](#connection-troubleshooting)
3. [Permission Testing](#permission-testing)
4. [Common Error Messages](#common-error-messages)
5. [Database Scripts](#database-scripts)

## Quick Verification

Run these commands to quickly verify your database connection and permissions.

### 1. Verify PostgreSQL is Running

```bash
pg_isready -h localhost -p 5432
```

Expected output: `localhost:5432 - accepting connections`

### 2. Verify Database Exists

```bash
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname='checklist';"
```

Expected output should include `checklist` in the results.

### 3. Verify User Exists

```bash
psql -U postgres -c "SELECT usename FROM pg_user WHERE usename='checklist_user';"
```

Expected output should include `checklist_user` in the results.

### 4. Test User Connection

```bash
psql -U checklist_user -d checklist -c "SELECT current_user, current_database();"
```

Expected output should show:
```
 current_user | current_database 
--------------+------------------
 checklist_user | checklist
```

### 5. Run Prisma Database Check

```bash
npx prisma db execute --file ./scripts/verify_permissions.sql
```

## Connection Troubleshooting

If you're experiencing connection issues, follow these steps:

### Connection String Format

The connection string in your `.env` file should follow this exact format:

```
DATABASE_URL="postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA"
```

Example:
```
DATABASE_URL="postgresql://checklist_user:securepassword@localhost:5432/checklist?schema=public"
```

### Common Connection Issues

1. **PostgreSQL not running**:
   ```bash
   # macOS (Homebrew)
   brew services start postgresql
   
   # Linux (systemd)
   sudo systemctl start postgresql
   ```

2. **Wrong port**:
   - Default PostgreSQL port is 5432
   - Check which port PostgreSQL is running on:
     ```bash
     psql -U postgres -c "SHOW port;"
     ```

3. **Password issues**:
   - Verify your password works:
     ```bash
     psql -U checklist_user -d checklist -W
     ```
   - Reset password if necessary:
     ```sql
     ALTER USER checklist_user WITH PASSWORD 'new_password';
     ```

4. **Host configuration**:
   - Check pg_hba.conf for allowed connections:
     ```bash
     psql -U postgres -c "SHOW hba_file;"
     ```

## Permission Testing

Test specific permissions required by the application:

### 1. Table Creation Permission

```sql
-- Connect as checklist_user
\c checklist checklist_user

-- Try to create a test table
CREATE TABLE _permission_test (id SERIAL PRIMARY KEY, test TEXT);

-- Verify table was created
\dt _permission_test

-- Clean up
DROP TABLE _permission_test;
```

### 2. CRUD Operation Permissions

```sql
-- Connect as checklist_user
\c checklist checklist_user

-- Create test table
CREATE TABLE _crud_test (id SERIAL PRIMARY KEY, content TEXT);

-- Test INSERT
INSERT INTO _crud_test (content) VALUES ('test1'), ('test2');

-- Test SELECT
SELECT * FROM _crud_test;

-- Test UPDATE
UPDATE _crud_test SET content = 'updated' WHERE content = 'test1';

-- Test DELETE
DELETE FROM _crud_test WHERE content = 'test2';

-- Clean up
DROP TABLE _crud_test;
```

### 3. Schema Permissions

```sql
-- Connect as checklist_user
\c checklist checklist_user

-- Check schema permissions
\dn+

-- Expected output should show checklist_user has USAGE permission on public schema
```

## Common Error Messages

### `Error: Error querying the database: Error: User 'checklist_user' was denied access on the database 'checklist.public'`

**Problem**: Schema-level permissions are missing

**Solution**:
```sql
-- Connect as postgres superuser
\c checklist postgres

-- Grant schema permissions
GRANT USAGE ON SCHEMA public TO checklist_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO checklist_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO checklist_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO checklist_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO checklist_user;
```

### `Error: Error querying the database: SequelizeConnectionRefusedError: connect ECONNREFUSED 127.0.0.1:5432`

**Problem**: PostgreSQL is not running or is using a different port

**Solution**:
```bash
# Start PostgreSQL
sudo service postgresql start  # Linux
brew services start postgresql  # macOS

# Check if PostgreSQL is running on a different port
sudo netstat -nlp | grep postgres
```

### `Error: Error querying the database: SequelizeAuthenticationError: password authentication failed for user "checklist_user"`

**Problem**: Password in .env file doesn't match the PostgreSQL user's password

**Solution**:
```sql
-- Reset password
ALTER USER checklist_user WITH PASSWORD 'newpassword';

-- Update .env file with new password
```

## Database Scripts

### Database Permission Verification Script

Create a file named `verify_permissions.sql` in the `scripts` directory:

```sql
-- verify_permissions.sql
-- This script verifies the necessary permissions for the checklist application
-- Run with: npx prisma db execute --file ./scripts/verify_permissions.sql

-- Test connection
SELECT 'Connection successful' AS status;

-- Test schema permissions
SELECT 'Schema permissions check' AS test;
SELECT schema_name, privilege_type 
FROM information_schema.role_usage_grants 
WHERE grantee = current_user 
  AND schema_name = 'public';

-- Test table permissions
SELECT 'Table permissions check' AS test;
SELECT table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE grantee = current_user 
  AND table_schema = 'public';

-- Create a temporary test table
CREATE TABLE IF NOT EXISTS _permission_test (
  id SERIAL PRIMARY KEY,
  test_value TEXT
);

-- Test insert
INSERT INTO _permission_test (test_value) VALUES ('Permission test');

-- Test select
SELECT * FROM _permission_test;

-- Test update
UPDATE _permission_test SET test_value = 'Updated permission test' WHERE test_value = 'Permission test';

-- Test delete
DELETE FROM _permission_test;

-- Test drop table
DROP TABLE _permission_test;

-- Final status
SELECT 'All permission tests passed successfully!' AS result;
```

### Node.js Connection Test Script

Create a file named `verify-connection.js` in the `scripts` directory:

```javascript
// scripts/verify-connection.js
// Run with: node scripts/verify-connection.js

const { PrismaClient } = require('@prisma/client');

async function verifyConnection() {
  console.log('Database Connection Verification Test');
  console.log('=====================================');
  
  let prisma;
  try {
    console.log('Initializing Prisma client...');
    prisma = new PrismaClient();
    
    console.log('Testing database connection...');
    const result = await prisma.$queryRaw`SELECT current_database(), current_user`;
    console.log('Connection successful!');
    console.log('Connected as:', result[0]);
    
    console.log('\nTesting database operations:');
    
    // Test creating a temporary table
    console.log('- Testing table creation...');
    await prisma.$executeRaw`CREATE TABLE IF NOT EXISTS _connection_test (id SERIAL PRIMARY KEY, test TEXT)`;
    
    // Test insertion
    console.log('- Testing insert operation...');
    await prisma.$executeRaw`INSERT INTO _connection_test (test) VALUES ('Test value')`;
    
    // Test selection
    console.log('- Testing select operation...');
    const selectResult = await prisma.$queryRaw`SELECT * FROM _connection_test`;
    console.log('  Records found:', selectResult.length);
    
    // Test update
    console.log('- Testing update operation...');
    await prisma.$executeRaw`UPDATE _connection_test SET test = 'Updated value'`;
    
    // Test delete
    console.log('- Testing delete operation...');
    await prisma.$executeRaw`DELETE FROM _connection_test`;
    
    // Test drop
    console.log('- Testing drop table operation...');
    await prisma.$executeRaw`DROP TABLE _connection_test`;
    
    console.log('\n✅ All database operations completed successfully!');
    console.log('✅ Your database connection is properly configured.');
    
  } catch (error) {
    console.error('\n❌ Database verification failed with error:');
    console.error(error);
    
    // Provide helpful error information
    if (error.message.includes('denied access')) {
      console.log('\nPossible permission issue:');
      console.log('1. Verify that the user has proper permissions');
      console.log('2. Run the SQL commands in DATABASE_SETUP.md to grant permissions');
    } else if (error.message.includes('ECONNREFUSED')) {
      console.log('\nPossible connection issue:');
      console.log('1. Verify that PostgreSQL is running');
      console.log('2. Check the connection details in your .env file');
    } else if (error.message.includes('authentication failed')) {
      console.log('\nPossible authentication issue:');
      console.log('1. Verify the username and password in your .env file');
      console.log('2. Reset the user password if necessary');
    }
  } finally {
    if (prisma) {
      console.log('\nDisconnecting from database...');
      await prisma.$disconnect();
    }
  }
}

verifyConnection();
```

To run this script:
```bash
node scripts/verify-connection.js