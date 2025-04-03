import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { generateUniqueHash } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title = "Untitled Checklist" } = body;

    // Generate a unique hash
    let hash = generateUniqueHash(8);
    let isUnique = false;

    // Ensure hash is unique
    while (!isUnique) {
      const existing = await prisma.checklist.findUnique({
        where: { hash },
      });
      
      if (!existing) {
        isUnique = true;
      } else {
        hash = generateUniqueHash(8);
      }
    }

    // Create new checklist in database
    const checklist = await prisma.checklist.create({
      data: {
        hash,
        title,
      },
    });

    return new NextResponse(
      JSON.stringify({
        id: checklist.id,
        hash: checklist.hash,
        title: checklist.title,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error: unknown) {
    console.error("Failed to create checklist:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new NextResponse(
      JSON.stringify({ 
        error: "Failed to create checklist",
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}