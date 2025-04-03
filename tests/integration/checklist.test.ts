const { PrismaClient } = require('@prisma/client');
const { generateUniqueHash } = require('@/app/api/checklists/route');

describe("Checklist Integration Tests", () => {
  const prisma = new PrismaClient();

  beforeAll(async () => {
    await prisma.$connect();
    await prisma.$executeRaw`TRUNCATE TABLE "Checklist", "ChecklistItem" CASCADE`;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  test("should connect to database", async () => {
    const isConnected = await prisma.$queryRaw`SELECT 1`;
    expect(isConnected).toBeTruthy();
  });

  test("should create a new checklist", async () => {
    const hash = generateUniqueHash();
    const checklist = await prisma.checklist.create({
      data: {
        hash,
        title: "Test Checklist",
      },
    });

    expect(checklist).toHaveProperty("id");
    expect(checklist.hash).toBe(hash);
  });

  test("should fail with invalid permissions", async () => {
    const testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: "postgresql://invalid:user@localhost:5432/checklist?schema=public",
        },
      },
    });

    await expect(
      testPrisma.checklist.findFirst()
    ).rejects.toThrow();
  });
});