import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Define the interface for checklist items
interface ChecklistItemWithPosition {
  id: string;
  position: number;
}

// Helper function to extract params from URL
function extractParams(url: string) {
  const match = url.match(/checklists\/([^\/]+)\/items\/([^\/]+)/);
  if (!match) throw new Error("Invalid URL format");
  return { hash: match[1], id: match[2] };
}

// PATCH to update a checklist item
export async function PATCH(request: Request) {
  try {
    const { hash, id } = extractParams(request.url);
    const body = await request.json();

    // Ensure the checklist exists
    const checklist = await prisma.checklist.findUnique({
      where: { hash },
    });

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    // Ensure the item exists and belongs to this checklist
    const existingItem = await prisma.checklistItem.findFirst({
      where: {
        id,
        checklistId: checklist.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found in this checklist" },
        { status: 404 }
      );
    }

    // Update the item
    const updatedItem = await prisma.checklistItem.update({
      where: { id },
      data: {
        ...body,
        updatedAt: new Date(),
      },
    });

    // Also update the checklist's updatedAt
    await prisma.checklist.update({
      where: { id: checklist.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}

// DELETE to remove a checklist item
export async function DELETE(request: Request) {
  try {
    const { hash, id } = extractParams(request.url);

    // Ensure the checklist exists
    const checklist = await prisma.checklist.findUnique({
      where: { hash },
    });

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    // Ensure the item exists and belongs to this checklist
    const existingItem = await prisma.checklistItem.findFirst({
      where: {
        id,
        checklistId: checklist.id,
      },
    });

    if (!existingItem) {
      return NextResponse.json(
        { error: "Item not found in this checklist" },
        { status: 404 }
      );
    }

    // Delete the item
    await prisma.checklistItem.delete({
      where: { id },
    });

    // Update the positions of remaining items
    const items = await prisma.checklistItem.findMany({
      where: { 
        checklistId: checklist.id,
        position: {
          gt: existingItem.position,
        },
      },
      orderBy: { position: "asc" },
    });

    // Update positions in a transaction
    if (items.length > 0) {
      await prisma.$transaction(
        items.map((item: ChecklistItemWithPosition) => 
          prisma.checklistItem.update({
            where: { id: item.id },
            data: { position: item.position - 1 },
          })
        )
      );
    }

    // Also update the checklist's updatedAt
    await prisma.checklist.update({
      where: { id: checklist.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting checklist item:", error);
    return NextResponse.json(
      { error: "Failed to delete checklist item" },
      { status: 500 }
    );
  }
}