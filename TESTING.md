# Testing Guide for Checklist App

This document provides comprehensive instructions for setting up and running tests for the Checklist application.

## Table of Contents

1. [Testing Overview](#testing-overview)
2. [Test Environment Setup](#test-environment-setup)
3. [Running Tests](#running-tests)
4. [Unit Tests](#unit-tests)
5. [Integration Tests](#integration-tests)
6. [End-to-End Tests](#end-to-end-tests)
7. [Test Database Configuration](#test-database-configuration)
8. [Common Testing Issues](#common-testing-issues)

## Testing Overview

The Checklist application uses a comprehensive testing strategy with three levels of tests:

1. **Unit Tests**: Test individual components in isolation
2. **Integration Tests**: Test interactions between components and API endpoints
3. **End-to-End Tests**: Test complete user flows and application functionality

## Test Environment Setup

### Prerequisites

- Node.js (v18 or later)
- npm (v9 or later)
- PostgreSQL (v14 or later)
- A properly configured test database (see [Test Database Configuration](#test-database-configuration))

### Initial Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env.test` file in the project root:
   ```
   DATABASE_URL="postgresql://checklist_user:securepassword@localhost:5432/checklist_test?schema=public"
   NODE_ENV=test
   ```

3. Set up the test database (see the [Database Configuration](#test-database-configuration) section)

4. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

## Running Tests

### Running All Tests

```bash
npm test
```

### Running Specific Test Suites

For unit tests:
```bash
npm run test:unit
```

For integration tests:
```bash
npm run test:integration
```

For end-to-end tests:
```bash
npm run test:e2e
```

### Running Tests in Watch Mode

```bash
npm test -- --watch
```

## Unit Tests

Unit tests focus on testing individual components in isolation. They use Jest and React Testing Library.

### Component Tests

Component tests verify that UI components render correctly and handle user interactions as expected.

Example component test (create-button.test.tsx):
```tsx
describe("CreateChecklistButton", () => {
  it("renders correctly", () => {
    render(<CreateChecklistButton />);
    expect(screen.getByText("Start New Checklist")).toBeInTheDocument();
  });

  it("handles successful checklist creation", async () => {
    // Test implementation
  });
});
```

### Writing Effective Unit Tests

1. Test component rendering
2. Test user interactions (clicks, input changes)
3. Test component state changes
4. Test proper handling of props
5. Mock external dependencies (API calls, context providers)

## Integration Tests

Integration tests verify that different parts of the application work together correctly.

### API Route Tests

API tests verify that API endpoints correctly handle requests and responses.

Example API test:
```typescript
test("should create a new checklist", async () => {
  const checklist = await prisma.checklist.create({
    data: {
      hash: generateUniqueHash(),
      title: "Test Checklist",
    },
  });

  expect(checklist).toHaveProperty("id");
});
```

### Database Integration Tests

Database tests verify that the application correctly interacts with the database.

## End-to-End Tests

End-to-end tests verify complete user flows and application functionality.

### User Flow Tests

These tests simulate user interactions with the application, testing features like:

1. Creating a new checklist
2. Adding items to a checklist
3. Checking/unchecking items
4. Reordering items
5. Sharing a checklist via URL

## Test Database Configuration

For testing, we use a separate database to avoid affecting development data.

### Creating the Test Database

1. Access PostgreSQL as a superuser:
   ```bash
   sudo -u postgres psql
   ```

2. Create the test database and user:
   ```sql
   CREATE DATABASE checklist_test;
   GRANT ALL PRIVILEGES ON DATABASE checklist_test TO checklist_user;
   ```

3. Connect to the test database and set up permissions:
   ```sql
   \c checklist_test
   
   GRANT USAGE ON SCHEMA public TO checklist_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO checklist_user;
   GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO checklist_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO checklist_user;
   ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO checklist_user;
   ALTER SCHEMA public OWNER TO checklist_user;
   ```

### Test Database Migrations

Run migrations on the test database:
```bash
NODE_ENV=test npx prisma migrate dev
```

### Test Data Seeding

Create test data for consistent testing:
```bash
NODE_ENV=test npx prisma db seed
```

## Common Testing Issues

### Database Connection Issues

If you encounter database connection issues during testing:

1. Verify the test database exists and is properly configured
2. Check that your `.env.test` file has the correct connection string
3. Ensure the test database user has the necessary permissions
4. Verify that PostgreSQL is running

### Test Data Inconsistency

If tests are failing due to inconsistent test data:

1. Use `beforeEach` or `beforeAll` hooks to reset the database state
2. Implement database transactions for each test
3. Use unique identifiers for test data to avoid collisions

### Slow Tests

If tests are running too slowly:

1. Mock external dependencies when possible
2. Use in-memory databases for unit tests
3. Parallelize test execution
4. Optimize database queries in test setup

### Mock Issues

If you're having trouble with mocks:

1. Verify that all external dependencies are properly mocked
2. Use Jest's `jest.mock()` function to mock modules
3. Use `jest.spyOn()` to spy on specific functions
4. Reset mocks between tests with `jest.clearAllMocks()`