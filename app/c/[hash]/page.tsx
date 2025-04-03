'use client';
import { Suspense } from 'react';
import { getChecklist } from './actions';
import { ChecklistClient } from './checklist-client';
import { ChecklistSkeleton } from '@/components/checklist/skeleton';

export default function Page({ params }: { params: { hash: string } }) {
  return (
    <div className="container mx-auto py-4 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<ChecklistSkeleton />}>
          <ChecklistLoader hash={params.hash} />
        </Suspense>
      </div>
    </div>
  );
}

async function ChecklistLoader({ hash }: { hash: string }) {
  const checklist = await getChecklist(hash);
  return (
    <ChecklistClient 
      checklistHash={hash}
      initialTitle={checklist.title}
      initialItems={checklist.items}
    />
  );
}