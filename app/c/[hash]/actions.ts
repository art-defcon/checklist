'use server';

import { prisma } from '@/lib/db/prisma';

interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
  checklistId: string;
}

export async function getChecklist(hash: string): Promise<{
  title: string;
  items: ChecklistItem[];
}> {
  const checklist = await prisma.checklist.findUnique({
    where: { hash },
    include: {
      items: {
        orderBy: { position: 'asc' },
        select: {
          id: true,
          text: true,
          isChecked: true,
          position: true,
          createdAt: true,
          updatedAt: true,
          checklistId: true
        }
      }
    }
  });

  if (!checklist) {
    throw new Error('Checklist not found');
  }

  return {
    title: checklist.title,
    items: checklist.items
  };
}