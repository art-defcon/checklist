import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Helper function to extract hash from URL
function extractHash(url: string) {
  const match = url.match(/checklists\/([^\/]+)\/items/);
  if (!match) throw new Error("Invalid URL format");
  return match[1];
}

// GET all items for a checklist
export async function GET(request: Request) {
  try {
    const hash = extractHash(request.url);

    // Find the checklist first
    const checklist = await prisma.checklist.findUnique({
      where: { hash },
    });

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    // Get all items for the checklist
    const items = await prisma.checklistItem.findMany({
      where: { checklistId: checklist.id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching checklist items:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist items" },
      { status: 500 }
    );
  }
}

// POST to create a new checklist item
export async function POST(request: Request) {
  try {
    const hash = extractHash(request.url);
    const body = await request.json();
    const { text } = body;

    // Validate request
    if (!text) {
      return NextResponse.json(
        { error: "Text is required" },
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

    // Get the current max position
    const maxPositionItem = await prisma.checklistItem.findFirst({
      where: { checklistId: checklist.id },
      orderBy: { position: "desc" },
    });

    const newPosition = maxPositionItem ? maxPositionItem.position + 1 : 0;

    // Create the new item
    const newItem = await prisma.checklistItem.create({
      data: {
        text,
        position: newPosition,
        checklistId: checklist.id,
      },
    });

    // Update the checklist's updatedAt
    await prisma.checklist.update({
      where: { id: checklist.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to create checklist item" },
      { status: 500 }
    );
  }
}