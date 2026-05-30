"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { FAQItem } from "./faq-item";
import { FAQDialog } from "./faq-dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { reorderFAQs } from "@/actions/admin/cms.actions";
import { toast } from "sonner";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
}

interface FAQManagerProps {
  faqs: FAQ[];
}

export function FAQManager({ faqs: initialFAQs }: FAQManagerProps) {
  const [faqs, setFaqs] = useState<FAQ[]>(initialFAQs);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = faqs.findIndex((faq) => faq.id === active.id);
      const newIndex = faqs.findIndex((faq) => faq.id === over.id);

      const newFaqs = arrayMove(faqs, oldIndex, newIndex);

      // Update order numbers
      const updatedFaqs = newFaqs.map((faq, index) => ({
        ...faq,
        order: index,
      }));

      setFaqs(updatedFaqs);

      // Save to backend
      const updates = updatedFaqs.map((faq) => ({
        id: faq.id,
        order: faq.order,
      }));

      const result = await reorderFAQs(updates);

      if (!result.success) {
        toast.error("Failed to reorder FAQs");
        setFaqs(initialFAQs); // Revert on error
      } else {
        toast.success("FAQs reordered successfully");
      }
    }
  };

  const handleAddNew = () => {
    setEditingFAQ(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFAQ(faq);
    setIsDialogOpen(true);
  };

  const handleSuccess = () => {
    setIsDialogOpen(false);
    setEditingFAQ(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {faqs.length} {faqs.length === 1 ? "FAQ" : "FAQs"} • Drag to reorder
        </p>
        <Button onClick={handleAddNew} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {faqs.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No FAQs yet</p>
          <Button onClick={handleAddNew} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Create your first FAQ
          </Button>
        </div>
      ) : (
        <div className="max-w-full overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
            measuring={{
              droppable: {
                strategy: MeasuringStrategy.Always,
              },
            }}
          >
            <SortableContext
              items={faqs.map((faq) => faq.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {faqs.map((faq) => (
                  <FAQItem key={faq.id} faq={faq} onEdit={handleEdit} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      <FAQDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        faq={editingFAQ}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
