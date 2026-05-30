"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Eye, EyeOff } from "lucide-react";
import { HeroSlidesList } from "./hero-slides-list";
import type { HeroSlide } from "@/prisma/generated/prisma";

interface HeroSlidesClientProps {
  initialSlides: HeroSlide[];
}

export function HeroSlidesClient({ initialSlides }: HeroSlidesClientProps) {
  const router = useRouter();
  const [slides, setSlides] = useState(initialSlides);
  const [showPreview, setShowPreview] = useState(false);

  const handleCreate = () => {
    router.push("/admin/hero-slides/new");
  };

  const handleEdit = (slide: HeroSlide) => {
    router.push(`/admin/hero-slides/${slide.id}/edit`);
  };

  const refreshSlides = (updatedSlides: HeroSlide[]) => {
    setSlides(updatedSlides);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Hero Slides</h1>
          <p className="text-sm  mt-1">Manage homepage hero carousel slides</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPreview(!showPreview)} className="gap-2">
            {showPreview ? (
              <>
                <EyeOff className="h-4 w-4" />
                Hide Preview
              </>
            ) : (
              <>
                <Eye className="h-4 w-4" />
                Show Preview
              </>
            )}
          </Button>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Slide
          </Button>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && slides.filter((s) => s.isActive).length > 0 && (
        <div className="bg-muted/50 rounded-lg p-6 border-2 border-dashed border-border">
          <h3 className="text-sm font-semibold mb-3">Live Preview</h3>
          <div className="bg-background rounded-lg overflow-hidden shadow-sm">
            {/* Preview will be rendered here - simplified version */}
            <div className="h-64 flex items-center justify-center bg-muted/30">
              <p className="text-muted-foreground text-sm">Preview will show active slides</p>
            </div>
          </div>
        </div>
      )}

      {/* Slides List */}
      <HeroSlidesList slides={slides} onEdit={handleEdit} onRefresh={refreshSlides} />
    </div>
  );
}
