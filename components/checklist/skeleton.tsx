export function ChecklistSkeleton() {
  return (
    <div className="border rounded-lg p-6 bg-card animate-pulse">
      <div className="h-8 bg-muted rounded-md mb-6 w-3/4"></div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="h-4 w-4 rounded-sm bg-muted"></div>
            <div className="h-6 bg-muted rounded-md flex-1"></div>
          </div>
        ))}
      </div>
    </div>
  );
}