import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function AddressesSkeleton() {
  return (
    <div className="space-y-4 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Addresses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-24" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-8 w-8 rounded" />
              </div>
            </div>

            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-24 mt-3" />
            </div>

            {i === 1 && (
              <div className="mt-4 pt-4 border-t">
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
