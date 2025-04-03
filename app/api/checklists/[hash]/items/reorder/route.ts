import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Helper function to extract hash from URL
function extractHash(url: string) {
  const match = url.match(/checklists\/([^\/]+)\/items\/reorder/);
  if (!match) throw new Error("Invalid URL format");
  return match[1];
}

export async function POST(request: Request) {
  try {
    const hash = extractHash(request.url);
    const body = await request.json();
    const { items } = body;

    // Validate request
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Items array is required" },
        { status: 400 }
      );
    }

    // Find the checklist
    const checklist = await prisma.checklist.findUnique({
      where: { hash },
    });

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    // Update each item's position in a transaction
    await prisma.$transaction(
      items.map((item: { id: string; position: number }) =>
        prisma.checklistItem.update({
          where: { 
            id: item.id,
            checklistId: checklist.id, // Ensure the item belongs to this checklist
          },
          data: { 
            position: item.position,
            updatedAt: new Date(),
          },
        })
      )
    );

    // Also update the checklist's updatedAt
    await prisma.checklist.update({
      where: { id: checklist.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering checklist items:", error);
    return NextResponse.json(
      { error: "Failed to reorder checklist items" },
      { status: 500 }
    );
  }
}