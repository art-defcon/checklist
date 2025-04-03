import { PrismaClient } from "@prisma/client";

declare global {
  // allow global `var` declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: process.env.NODE_ENV === "production" ? "minimal" : "pretty",
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Enhanced database connection error handling
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error) {
    if (process.env.NODE_ENV === "production") {
      console.error("Database error:", error);
      
      // Handle specific error types
      if (error instanceof Error && error.message.includes("denied access")) {
        throw new Error("Database permission denied. Please verify your database user permissions.");
      } else if (error instanceof Error && error.message.includes("connection refused")) {
        throw new Error("Could not connect to database. Please verify the database is running and connection details are correct.");
      } else if (error instanceof Error && error.message.includes("authentication failed")) {
        throw new Error("Database authentication failed. Please verify your username and password.");
      }
      
      throw new Error("A database error occurred");
    }
    throw error;
  }
});

// Enhanced connection verification
export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    // Test basic connectivity
    await prisma.$queryRaw`SELECT 1`;
    
    // Test schema access
    const schemaCheck = await prisma.$queryRaw<Array<{schema_name: string}>>`
      SELECT schema_name 
      FROM information_schema.schemata 
      WHERE schema_name = 'public'
    `;
    
    if (!schemaCheck || schemaCheck.length === 0) {
      throw new Error("Public schema not found or not accessible");
    }
    
    return true;
  } catch (error) {
    console.error("Database connection error:", error);
    
    // Provide specific troubleshooting advice
    if (error instanceof Error && error.message.includes("permission denied")) {
      console.error("Troubleshooting: Verify the database user has proper permissions on the public schema");
      console.error("Run: GRANT USAGE ON SCHEMA public TO checklist_user");
    } else if (error instanceof Error && error.message.includes("connection refused")) {
      console.error("Troubleshooting: Verify PostgreSQL is running and the connection details are correct");
    }
    
    return false;
  }
}

// Connection retry logic with exponential backoff
export async function ensureDatabaseConnection(retries = 3, delay = 1000): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      if (await checkDatabaseConnection()) {
        return true;
      }
    } catch (error) {
      console.error(`Connection attempt ${i + 1} failed:`, error);
    }
    
    if (i < retries - 1) {
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }
  }
  return false;
}

// Graceful shutdown handlers
process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Initialize connection on startup
(async () => {
  console.log("Verifying database connection...");
  const connected = await ensureDatabaseConnection();
  if (!connected) {
    console.error("Failed to establish database connection");
    process.exit(1);
  }
  console.log("Database connection verified");
})();