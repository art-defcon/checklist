# Zug-Zug Checklist - Technical Setup Guide

## Development Environment Setup

### Prerequisites
- Node.js (v18 or later)
- npm (v9 or later)
- PostgreSQL (v14 or later)

### Installation Steps
1. Clone the repository
   ```bash
   git clone <repository-url>
   cd checklist
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up your PostgreSQL database:
   - Create a new PostgreSQL database for the project
   - Update the `.env` file with your connection string (see Environment Variables section)

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variable Configuration

This application requires these environment variables:

```
DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="https://your-app-url.vercel.app"
```

### Development Environment Example
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/checklist?schema=public"
```

## Database Setup

### Development Database Setup
1. Install PostgreSQL if you haven't already
   - macOS: `brew install postgresql`
   - Windows: Download from the [PostgreSQL website](https://www.postgresql.org/download/windows/)
   - Linux: `sudo apt install postgresql`

2. Create a new database:
   ```bash
   psql -U postgres
   CREATE DATABASE checklist;
   \q
   ```

3. Update your `.env` file with the correct connection string

4. Run migrations to set up the schema:
   ```bash
   npx prisma migrate dev
   ```

5. (Optional) Seed the database with test data:
   ```bash
   npx prisma db seed
   ```

## Deployment Guide

### Prerequisites
- Node.js v18+
- PostgreSQL database
- Vercel account (for hosting)
- Environment variables configured

### Build and Deployment
1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the application:
   ```bash
   npm run build
   ```

3. Run production database migrations:
   ```bash
   npx prisma migrate deploy
   ```

4. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

## Maintenance and Troubleshooting

### Common Issues

#### Database Connection Issues
1. **Connection refused errors**:
   - Check if PostgreSQL is running: `pg_isready`
   - Verify your DATABASE_URL has the correct host, port, username, and password
   - Ensure your database user has the necessary permissions

2. **Prisma Client Issues**:
   - If you encounter Prisma Client errors, try regenerating the client:
     ```bash
     npx prisma generate
     ```
   - For schema drift issues:
     ```bash
     npx prisma migrate reset
     ```

#### API Request Failures
If API requests fail:
1. Check the server console for error messages
2. Verify the API route path is correct
3. Ensure the request method (GET, POST, etc.) matches the API route definition
4. Check that the request body is properly formatted (for POST/PUT requests)

### Database Maintenance
- Regularly backup your database:
  ```bash
  pg_dump -U postgres checklist > backup_$(date +%Y%m%d).sql
  ```

- Monitor database size and performance:
  ```bash
  psql -U postgres -d checklist -c "SELECT pg_size_pretty(pg_database_size('checklist'));"
  ```

### Keeping Dependencies Updated
- Update dependencies regularly:
  ```bash
  npm update
  ```

- For major updates, check the release notes of each package before updating