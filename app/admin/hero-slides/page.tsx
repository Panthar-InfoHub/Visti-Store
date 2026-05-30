import { getHeroSlides } from "@/actions/admin/hero-slide.actions";
import { HeroSlidesClient } from "@/components/admin/hero-slides/hero-slides-client";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default async function HeroSlidesPage() {
  const result = await getHeroSlides();

  return (
    <div className="p-8">
      <Suspense
        fallback={
          <div className="space-y-4">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-96 w-full" />
          </div>
        }
      >
        <HeroSlidesClient initialSlides={result.success ? result.data || [] : []} />
      </Suspense>
    </div>
  );
}
