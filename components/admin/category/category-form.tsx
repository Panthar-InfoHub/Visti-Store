"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MediaSection } from "@/components/admin/shared/media-section";
import { createCategory, updateCategory, getCategories } from "@/actions/admin/category.actions";
import { toast } from "sonner";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface CategoryFormProps {
  category?: any;
  mode: "create" | "edit";
}

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    order: 0,
    isActive: true,
    isFeatured: false,
    parentId: null as string | null,
  });

  useEffect(() => {
    const fetchCategories = async () => {
      const result = await getCategories();
      if (result.success && result.data) {
        // Filter out current category to prevent self-parenting
        const availableCategories = result.data.filter((cat: any) => cat.id !== category?.id);
        setCategories(availableCategories);
      }
    };
    fetchCategories();

    if (category) {
      setFormData({
        name: category.name || "",
        slug: category.slug || "",
        description: category.description || "",
        order: category.order || 0,
        isActive: category.isActive ?? true,
        isFeatured: category.isFeatured ?? false,
        parentId: category.parentId || null,
      });
      setMediaFiles(category.image ? [category.image] : []);
    }
  }, [category]);

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      // Auto-generate slug from name
      slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, ""),
    });
  };

  // Build hierarchical category tree
  const buildCategoryTree = (cats: any[]): any[] => {
    const map = new Map<string, any>();
    const roots: any[] = [];

    cats.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    cats.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parentId) {
        const parent = map.get(cat.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Flatten tree for display with indentation levels
  const flattenTree = (
    tree: any[],
    level = 0,
    result: Array<any & { level: number }> = []
  ): Array<any & { level: number }> => {
    tree.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        flattenTree(cat.children, level + 1, result);
      }
    });
    return result;
  };

  const hierarchicalCategories = flattenTree(buildCategoryTree(categories));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Use the first media file as the category image
      const dataToSubmit = {
        ...formData,
        image: mediaFiles.length > 0 ? mediaFiles[0] : "",
      };

      const result = category
        ? await updateCategory(category.id, dataToSubmit)
        : await createCategory(dataToSubmit);

      if (result.success) {
        toast.success(`Category ${category ? "updated" : "created"} successfully`);
        router.push("/admin/categories");
      } else {
        toast.error(result.error || "Failed to save category");
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild type="button">
            <Link href="/admin/categories">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "create" ? "Add Category" : "Edit Category"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === "create" ? "Create a new category" : "Update category information"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/categories")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>{mode === "create" ? "Create Category" : "Update Category"}</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Media Section */}
          <Card>
            <CardHeader>
              <CardTitle>Category Image</CardTitle>
              <CardDescription>Upload a category image (max 1 image, 5MB)</CardDescription>
            </CardHeader>
            <CardContent>
              <MediaSection
                media={mediaFiles}
                onChange={setMediaFiles}
                maxFiles={1}
                maxSizeMB={5}
              />
            </CardContent>
          </Card>

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential category details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Enter category name..."
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="enter-category-slug"
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter category description..."
                  rows={4}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Category configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category</Label>
                <Select
                  value={formData.parentId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, parentId: value === "none" ? null : value })
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger id="parentId">
                    <SelectValue placeholder="None (Top Level)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">📁 None (Top Level)</SelectItem>
                    {hierarchicalCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span style={{ paddingLeft: `${cat.level * 16}px` }}>
                          {cat.level > 0 ? "└─ " : "📁 "}
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select a parent to make this a subcategory
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="order">Priority</Label>
                <Input
                  id="order"
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                  }
                  placeholder="0"
                  disabled={isLoading}
                />
                <p className="text-xs text-muted-foreground">
                  Lower numbers show first. Use this to prioritize categories.
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-xs text-muted-foreground">Show this category on the store</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="isFeatured">Featured</Label>
                  <p className="text-xs text-muted-foreground">Show in featured section (max 5)</p>
                </div>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
