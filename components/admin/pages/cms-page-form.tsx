"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { updateCMSPage } from "@/actions/admin/cms.actions";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

const cmsPageSchema = z.object({
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().max(200, "Meta title is too long").optional(),
  metaDescription: z.string().max(500, "Meta description is too long").optional(),
  isPublished: z.boolean(),
});

type CMSPageFormData = z.infer<typeof cmsPageSchema>;

interface CMSPageFormProps {
  page: {
    id: string;
    slug: string;
    title: string;
    content: string;
    metaTitle: string | null;
    metaDescription: string | null;
    isPublished: boolean;
  };
}

export function CMSPageForm({ page }: CMSPageFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CMSPageFormData>({
    resolver: zodResolver(cmsPageSchema),
    defaultValues: {
      content: page.content || "",
      metaTitle: page.metaTitle || "",
      metaDescription: page.metaDescription || "",
      isPublished: page.isPublished || false,
    },
  });

  async function onSubmit(data: CMSPageFormData) {
    setIsLoading(true);
    try {
      const result = await updateCMSPage(page.id, data);

      if (result.success) {
        toast.success("Page updated successfully!");
        router.push("/admin/pages");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to update page");
      }
    } catch (error) {
      toast.error("An error occurred while updating the page");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{page.title}</CardTitle>
            <p className="text-sm text-muted-foreground">/{page.slug}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your page content here... (Supports basic HTML)"
                      className="min-h-[400px] font-mono"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    You can use HTML for formatting (e.g., &lt;p&gt;, &lt;h2&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, etc.)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* SEO Settings */}
        <Card>
          <CardHeader>
            <CardTitle>SEO Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="metaTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Leave empty to use page title" {...field} />
                  </FormControl>
                  <FormDescription>
                    The title that appears in search results (optional)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="metaDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meta Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="A brief description of this page for search engines"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    The description that appears in search results (recommended: 150-160 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Publishing */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="isPublished"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publish Page</FormLabel>
                    <FormDescription>
                      Make this page visible on your website
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Update Page
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/pages")}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
