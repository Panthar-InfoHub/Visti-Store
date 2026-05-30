"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, X } from "lucide-react";
import { ProductFaq } from "@/lib/zod-schema";

interface FaqEditorProps {
  faqs: ProductFaq[];
  onChange: (faqs: ProductFaq[]) => void;
}

export function FaqEditor({ faqs, onChange }: FaqEditorProps) {
  const addFaq = () => {
    onChange([...faqs, { question: "", answer: "" }]);
  };

  const updateFaq = (index: number, field: keyof ProductFaq, value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    onChange(newFaqs);
  };

  const removeFaq = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      {faqs.map((faq, index) => (
        <Card key={index} className="border-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">FAQ #{index + 1}</CardTitle>
              <Button type="button" variant="ghost" size="sm" onClick={() => removeFaq(index)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Input
                value={faq.question}
                onChange={(e) => updateFaq(index, "question", e.target.value)}
                placeholder="Enter question"
              />
            </div>
            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea
                value={faq.answer}
                onChange={(e) => updateFaq(index, "answer", e.target.value)}
                placeholder="Enter answer"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      ))}

      <Button type="button" variant="outline" onClick={addFaq} className="w-full">
        <Plus className="h-4 w-4 mr-2" />
        Add FAQ
      </Button>
    </div>
  );
}
