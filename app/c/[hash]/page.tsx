import { Suspense } from 'react';
import { getChecklist } from './actions';
import { ChecklistClient } from './checklist-client';
import { ChecklistSkeleton } from '@/components/checklist/skeleton';

export default async function Page({ params }: { params: { hash: string } }) {
  const checklist = await getChecklist(params.hash);
  
  return (
    <div className="container mx-auto py-4 sm:py-8">
      <div className="max-w-2xl mx-auto">
        <Suspense fallback={<ChecklistSkeleton />}>
          <ChecklistClient 
            checklistHash={params.hash}
            initialTitle={checklist.title}
            initialItems={checklist.items}
          />
        </Suspense>
      </div>
    </div>
  );
}