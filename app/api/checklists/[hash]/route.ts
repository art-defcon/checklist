import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

// Helper function to extract hash from URL
function extractHash(url: string) {
  const match = url.match(/checklists\/([^\/]+)/);
  if (!match) throw new Error("Invalid URL format");
  return match[1];
}

// GET a checklist by hash
export async function GET(request: Request) {
  try {
    const hash = extractHash(request.url);

    const checklist = await prisma.checklist.findUnique({
      where: { hash },
      include: {
        items: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!checklist) {
      return NextResponse.json(
        { error: "Checklist not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(checklist);
  } catch (error) {
    console.error("Error fetching checklist:", error);
    return NextResponse.json(
      { error: "Failed to fetch checklist" },
      { status: 500 }
    );
  }
}

// PATCH to update a checklist title
export async function PATCH(request: Request) {
  try {
    const hash = extractHash(request.url);
    const body = await request.json();
    const { title } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    const checklist = await prisma.checklist.update({
      where: { hash },
      data: { 
        title,
        updatedAt: new Date()
      },
    });

    return NextResponse.json(checklist);
  } catch (error) {
    console.error("Error updating checklist:", error);
    return NextResponse.json(
      { error: "Failed to update checklist" },
      { status: 500 }
    );
  }
}