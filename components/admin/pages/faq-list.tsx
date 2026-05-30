"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { addFAQ, deleteFAQ, updateFAQ } from "@/actions/admin/cms.actions";
import { Edit, Loader2, Plus, Trash, GripVertical } from "lucide-react";

const faqSchema = z.object({
  question: z.string().min(1, "Question is required").max(500, "Question is too long"),
  answer: z.string().min(1, "Answer is required"),
  isPublished: z.boolean().optional(),
});

type FAQFormData = z.infer<typeof faqSchema>;

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
}

interface FAQListProps {
  faqs: FAQ[];
}

export function FAQList({ faqs: initialFaqs }: FAQListProps) {
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [faqToDelete, setFaqToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: "",
      answer: "",
      isPublished: false,
    },
  });

  const startAdding = () => {
    setIsAdding(true);
    setEditingId(null);
    form.reset({ question: "", answer: "", isPublished: false });
  };

  const startEditing = (faq: FAQ) => {
    setIsAdding(false);
    setEditingId(faq.id);
    form.reset({
      question: faq.question,
      answer: faq.answer,
      isPublished: faq.isPublished,
    });
  };

  const cancelForm = () => {
    setIsAdding(false);
    setEditingId(null);
    form.reset();
  };

  const onSubmit = async (data: FAQFormData) => {
    setIsSubmitting(true);
    try {
      const result = editingId ? await updateFAQ(editingId, data) : await addFAQ(data);

      if (result.success) {
        toast.success(editingId ? "FAQ updated successfully" : "FAQ added successfully");
        cancelForm();
        router.refresh();
      } else {
        toast.error(result.error || "Failed to save FAQ");
      }
    } catch (error) {
      toast.error("An error occurred while saving FAQ");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!faqToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteFAQ(faqToDelete);

      if (result.success) {
        toast.success("FAQ deleted successfully");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to delete FAQ");
      }
    } catch (error) {
      toast.error("An error occurred while deleting FAQ");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setFaqToDelete(null);
    }
  };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const result = await updateFAQ(id, {
        isPublished: !currentStatus,
      });

      if (result.success) {
        toast.success(currentStatus ? "FAQ unpublished" : "FAQ published");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update FAQ");
      }
    } catch (error) {
      toast.error("An error occurred while updating FAQ");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">FAQ Management</h3>
          <p className="text-sm text-muted-foreground">
            Manage frequently asked questions that appear on your website
          </p>
        </div>
        {!isAdding && !editingId && (
          <Button onClick={startAdding}>
            <Plus className="w-4 h-4 mr-2" />
            Add FAQ
          </Button>
        )}
      </div>

      {/* Add/Edit Form */}
      {(isAdding || editingId) && (
        <Card className="border-2 border-primary">
          <CardContent className="pt-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Question</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., What is your return policy?" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="answer"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Answer</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed answer..."
                          className="min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingId ? "Update FAQ" : "Add FAQ"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelForm}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* FAQ List */}
      {initialFaqs.length === 0 ? (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No FAQs added yet</p>
          <Button onClick={startAdding} variant="outline" className="mt-4">
            <Plus className="w-4 h-4 mr-2" />
            Add your first FAQ
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {initialFaqs.map((faq) => (
            <Card key={faq.id} className={editingId === faq.id ? "opacity-50" : ""}>
              <CardContent className="pt-6">
                <div className="flex gap-4">
                  <div className="shrink-0">
                    <GripVertical className="w-5 h-5 text-muted-foreground mt-1" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-semibold text-lg">{faq.question}</h4>
                      <Badge variant={faq.isPublished ? "default" : "secondary"}>
                        {faq.isPublished ? "Published" : "Draft"}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                  </div>
                  <div className="shrink-0 flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(faq)}
                      disabled={isAdding || editingId !== null}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublish(faq.id, faq.isPublished)}
                      disabled={isAdding || editingId !== null}
                    >
                      {faq.isPublished ? "📤" : "📥"}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFaqToDelete(faq.id);
                        setDeleteDialogOpen(true);
                      }}
                      disabled={isAdding || editingId !== null}
                    >
                      <Trash className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete FAQ?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this FAQ.
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
