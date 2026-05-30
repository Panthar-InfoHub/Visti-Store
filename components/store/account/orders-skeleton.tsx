import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function OrdersSkeleton() {
  return (
    <div className="space-y-4 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-6">
            {/* Order Header */}
            <div className="flex items-center justify-between mb-4 pb-4 border-b">
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-4">
              {[1, 2].map((j) => (
                <div key={j} className="flex gap-3">
                  <Skeleton className="h-16 w-16 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-24" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                </div>
              ))}
            </div>

            {/* Order Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="space-y-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-10 w-32" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
