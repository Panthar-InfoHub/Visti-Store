"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { GripVertical, MoreVertical, Pencil, Trash2, Eye, EyeOff, ChevronDown } from "lucide-react";
import { useState } from "react";
import { deleteFAQ, updateFAQ } from "@/actions/admin/cms.actions";
import { toast } from "sonner";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
}

interface FAQItemProps {
  faq: FAQ;
  onEdit: (faq: FAQ) => void;
}

export function FAQItem({ faq, onEdit }: FAQItemProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isTogglingPublish, setIsTogglingPublish] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: faq.id,
  });

  const style = {
    transform: transform
      ? CSS.Transform.toString({
          ...transform,
          x: 0, // Lock horizontal movement
          scaleX: 1,
          scaleY: 1,
        })
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteFAQ(faq.id);

    if (result.success) {
      toast.success("FAQ deleted successfully");
      setIsDeleteDialogOpen(false);
      // revalidatePath is called inside deleteFAQ action
    } else {
      toast.error(result.error || "Failed to delete FAQ");
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const handleTogglePublish = async () => {
    setIsTogglingPublish(true);
    const result = await updateFAQ(faq.id, {
      isPublished: !faq.isPublished,
    });

    if (result.success) {
      toast.success(faq.isPublished ? "FAQ unpublished" : "FAQ published");
      setIsTogglingPublish(false);
      // revalidatePath is called inside updateFAQ action
    } else {
      toast.error(result.error || "Failed to update FAQ");
      setIsTogglingPublish(false);
    }
  };

  return (
    <>
      <Card ref={setNodeRef} style={style} className="overflow-hidden py-1">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardHeader className="py-3 px-4">
            <div className="flex items-center gap-2">
              {/* Drag Handle */}
              <button
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors touch-none"
                {...attributes}
                {...listeners}
              >
                <GripVertical className="h-4 w-4" />
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0 flex items-center justify-between gap-3">
                <div className="flex-1 min-w-0 flex items-center gap-2">
                  <Badge
                    variant={faq.isPublished ? "default" : "secondary"}
                    className="text-xs px-1.5 py-0"
                  >
                    {faq.isPublished ? "Published" : "Draft"}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-mono">#{faq.order + 1}</span>
                  <CardTitle className="text-sm font-medium leading-tight truncate">
                    {faq.question}
                  </CardTitle>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 px-2">
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform ${
                          isOpen ? "transform rotate-180" : ""
                        }`}
                      />
                    </Button>
                  </CollapsibleTrigger>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                        <MoreVertical className="h-3.5 w-3.5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem onClick={() => onEdit(faq)} className="text-xs">
                        <Pencil className="h-3.5 w-3.5 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={handleTogglePublish}
                        disabled={isTogglingPublish}
                        className="text-xs"
                      >
                        {faq.isPublished ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setIsDeleteDialogOpen(true)}
                        className="text-destructive focus:text-destructive text-xs"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardHeader>

          <CollapsibleContent>
            <CardContent className="pt-0 pb-3 px-4 pl-10">
              <CardDescription className="whitespace-pre-wrap text-xs">
                {faq.answer}
              </CardDescription>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this FAQ? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
