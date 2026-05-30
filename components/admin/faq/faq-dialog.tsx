"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { addFAQ, updateFAQ } from "@/actions/admin/cms.actions";
import { toast } from "sonner";

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
}

interface FAQDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  faq: FAQ | null;
  onSuccess: () => void;
}

export function FAQDialog({ open, onOpenChange, faq, onSuccess }: FAQDialogProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isPublished, setIsPublished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!faq;

  useEffect(() => {
    if (faq) {
      setQuestion(faq.question);
      setAnswer(faq.answer);
      setIsPublished(faq.isPublished);
    } else {
      setQuestion("");
      setAnswer("");
      setIsPublished(false);
    }
  }, [faq, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim() || !answer.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSaving(true);

    const data = {
      question: question.trim(),
      answer: answer.trim(),
      isPublished,
    };

    const result = isEditing ? await updateFAQ(faq.id, data) : await addFAQ(data);

    setIsSaving(false);

    if (result.success) {
      toast.success(isEditing ? "FAQ updated successfully" : "FAQ added successfully");
      onOpenChange(false); // Close dialog
      onSuccess();
    } else {
      toast.error(result.error || "Failed to save FAQ");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the question and answer for this FAQ"
                : "Create a new frequently asked question"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="What is your return policy?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="We accept returns within 30 days..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">
                Provide a clear and helpful answer to the question
              </p>
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="publish">Publish FAQ</Label>
                <p className="text-sm text-muted-foreground">Make this FAQ visible to customers</p>
              </div>
              <Switch id="publish" checked={isPublished} onCheckedChange={setIsPublished} />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : isEditing ? "Update FAQ" : "Add FAQ"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
