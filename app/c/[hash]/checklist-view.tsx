'use server';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db/prisma';
import { ChecklistItem } from '@/types';
import { ChecklistClient } from './checklist-client';

export async function ChecklistView({ hash }: { hash: string }) {
  try {
    const checklist = await prisma.checklist.findUnique({
      where: { hash },
      include: {
        items: {
          orderBy: { position: 'asc' }
        }
      }
    });

    if (!checklist) {
      return notFound();
    }

    return (
      <ChecklistClient 
        checklistHash={hash}
        initialTitle={checklist.title}
        initialItems={checklist.items as unknown as ChecklistItem[]}
      />
    );
  } catch (error) {
    console.error('Error loading checklist:', error);
    return notFound();
  }
}