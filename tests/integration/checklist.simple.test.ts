import { PrismaClient } from '@prisma/client';
import { generateUniqueHash } from '@/lib/utils';

async function runTests() {
  const prisma = new PrismaClient();

  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection test passed');

    // Test checklist creation
    const hash = generateUniqueHash();
    const checklist = await prisma.checklist.create({
      data: { hash, title: 'Test Checklist' }
    });
    console.log('✅ Checklist creation test passed');

    // Cleanup
    await prisma.checklist.delete({ where: { id: checklist.id } });
    console.log('✅ Cleanup completed');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();