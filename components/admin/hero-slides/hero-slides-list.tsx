"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, GripVertical, ImageIcon, FileText } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deleteHeroSlide, getHeroSlides, updateHeroSlidesOrder } from "@/actions/admin/hero-slide.actions";
import { toast } from "sonner";
import type { HeroSlide } from "@/prisma/generated/prisma";
import Image from "next/image";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface HeroSlidesListProps {
  slides: HeroSlide[];
  onEdit: (slide: HeroSlide) => void;
  onRefresh: (slides: HeroSlide[]) => void;
}

interface SortableSlideItemProps {
  slide: HeroSlide;
  onEdit: (slide: HeroSlide) => void;
  onDelete: (id: string) => void;
}

function SortableSlideItem({ slide, onEdit, onDelete }: SortableSlideItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: slide.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-6">
      <div className="flex gap-4">
        {/* Drag Handle */}
        <div
          className="flex items-center cursor-move"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5 text-muted-foreground" />
        </div>

        {/* Image Preview */}
        <div className="relative h-24 w-40 rounded-lg overflow-hidden bg-muted shrink-0">
          <Image
            src={slide.image}
            alt={slide.imageAlt || "Hero slide"}
            fill
            className="object-cover"
            sizes="160px"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2">
            <div className="flex items-center gap-2">
              <Badge variant={slide.slideType === "IMAGE_ONLY" ? "secondary" : "default"}>
                {slide.slideType === "IMAGE_ONLY" ? (
                  <>
                    <ImageIcon className="h-3 w-3 mr-1" />
                    Image Only
                  </>
                ) : (
                  <>
                    <FileText className="h-3 w-3 mr-1" />
                    With Content
                  </>
                )}
              </Badge>
              <Badge variant={slide.isActive ? "default" : "outline"}>
                {slide.isActive ? "Active" : "Inactive"}
              </Badge>
              <span className="text-xs text-muted-foreground">Order: {slide.order}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => onEdit(slide)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(slide.id)}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {slide.slideType === "IMAGE_WITH_CONTENT" && (
            <div className="space-y-1">
              {slide.title && (
                <h3 className="font-semibold truncate">{slide.title}</h3>
              )}
              {slide.subtitle && (
                <p className="text-sm text-muted-foreground truncate">{slide.subtitle}</p>
              )}
              {slide.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{slide.description}</p>
              )}
              {slide.buttonText && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">
                    {slide.buttonText}
                  </span>
                  {slide.buttonLink && (
                    <span className="text-xs text-muted-foreground">{slide.buttonLink}</span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function HeroSlidesList({ slides, onEdit, onRefresh }: HeroSlidesListProps) {
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [localSlides, setLocalSlides] = useState(slides);

  // Sync localSlides when slides prop changes
  useEffect(() => {
    setLocalSlides(slides);
  }, [slides]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = localSlides.findIndex((slide) => slide.id === active.id);
    const newIndex = localSlides.findIndex((slide) => slide.id === over.id);

    const newSlides = arrayMove(localSlides, oldIndex, newIndex);
    
    // Update local state immediately for smooth UX
    setLocalSlides(newSlides);

    // Update order in database
    const updates = newSlides.map((slide, index) => ({
      id: slide.id,
      order: index,
    }));

    const result = await updateHeroSlidesOrder(updates);

    if (result.success) {
      toast.success("Slide order updated");
      // Refresh from database to get latest data
      const slidesResult = await getHeroSlides();
      if (slidesResult.success && slidesResult.data) {
        setLocalSlides(slidesResult.data);
        onRefresh(slidesResult.data);
      }
    } else {
      toast.error(result.error || "Failed to update order");
      // Revert on error
      setLocalSlides(slides);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    setIsDeleting(true);
    const result = await deleteHeroSlide(deleteId);

    if (result.success) {
      toast.success("Slide deleted successfully");
      const slidesResult = await getHeroSlides();
      if (slidesResult.success && slidesResult.data) {
        setLocalSlides(slidesResult.data);
        onRefresh(slidesResult.data);
      }
    } else {
      toast.error(result.error || "Failed to delete slide");
    }

    setIsDeleting(false);
    setDeleteId(null);
  };

  if (localSlides.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">No hero slides yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              Create your first hero slide to showcase content on your homepage
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localSlides.map((slide) => slide.id)}
          strategy={verticalListSortingStrategy}
        >
          {localSlides.map((slide) => (
            <SortableSlideItem
              key={slide.id}
              slide={slide}
              onEdit={onEdit}
              onDelete={setDeleteId}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Hero Slide</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this hero slide? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
