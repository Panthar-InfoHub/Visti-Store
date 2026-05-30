"use client";

import { useState, useEffect } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { createProduct, updateProduct } from "@/actions/admin/product.actions";
import { getCategories } from "@/actions/admin/category.actions";
import { ArrowLeft, Loader2, Plus, X, Package } from "lucide-react";
import Link from "next/link";
import { productSchema, type ProductFormData, ProductSection, ProductFaq } from "@/lib/zod-schema";
import { MediaSection } from "@/components/admin/shared/media-section";
import { SectionEditor } from "./section-editor";
import { FaqEditor } from "./faq-editor";

interface Category {
  id: string;
  name: string;
  parentId?: string | null;
}

interface ProductFormProps {
  product?: any;
  mode: "create" | "edit";
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
    </div>
  );
}

export function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  const getDefaultValues = (): ProductFormData => {
    if (product) {
      return {
        title: product.title || "",
        slug: product.slug || "",
        hsnCode: product.hsnCode || "",
        shortDescription: product.shortDescription || "",
        description: product.description || "",
        video: product.video || "",
        categoryId: product.categoryId || null,
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured || false,
        isBestSeller: product.isBestSeller || false,
        isOnSale: product.isOnSale || false,
        isNewArrival: product.isNewArrival || false,
        sections: Array.isArray(product.sections)
          ? product.sections
          : typeof product.sections === 'string'
            ? JSON.parse(product.sections)
            : [],
        faqs: Array.isArray(product.faqs)
          ? product.faqs
          : typeof product.faqs === 'string'
            ? JSON.parse(product.faqs)
            : [],
        tags: product.tags || [],
        variants: Array.isArray(product.variants) && product.variants.length > 0 
          ? product.variants 
          : [{
              name: "Default",
              sku: "",
              images: [],
              mrp: 0,
              sellingPrice: 0,
              stock: 0,
              isActive: true,
              sortOrder: 0
            }],
      };
    }

    return {
      title: "",
      slug: "",
      shortDescription: "",
      hsnCode: "",
      description: "",
      video: "",
      categoryId: null,
      isActive: true,
      isFeatured: false,
      isBestSeller: false,
      isOnSale: false,
      isNewArrival: false,
      sections: [],
      faqs: [],
      tags: [],
      variants: [{
        name: "Default",
        sku: "",
        images: [],
        mrp: 0,
        sellingPrice: 0,
        stock: 0,
        isActive: true,
        sortOrder: 0
      }],
    };
  };

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: getDefaultValues(),
  });

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getCategories();
        if (result.success && result.data) {
          setCategories(result.data as any);
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsInitializing(false);
      }
    };
    fetchCategories();
  }, []);

  // Auto-generate slug from title
  const title = watch("title");
  useEffect(() => {
    if (title && mode === "create") {
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setValue("slug", slug);
    }
  }, [title, setValue, mode]);

  // Build hierarchical category tree
  const buildCategoryTree = (cats: Category[]): any[] => {
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

  const onSubmit = async (data: ProductFormData) => {
    setIsLoading(true);
    try {
      const result =
        mode === "create" ? await createProduct(data) : await updateProduct(product.id, data);

      if (result.success) {
        toast.success(`Product ${mode === "create" ? "created" : "updated"} successfully`);
        router.push("/admin/products");
        router.refresh();
      } else {
        toast.error(result.error || `Failed to ${mode} product`);
      }
    } catch (error) {
      console.error(`Error ${mode}ing product:`, error);
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isInitializing) {
    return <FormSkeleton />;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {mode === "create" ? "Add Product" : "Edit Product"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {mode === "create" ? "Create a new product" : "Update product information"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
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
              <>{mode === "create" ? "Create Product" : "Update Product"}</>
            )}
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="sections">Sections</TabsTrigger>
              <TabsTrigger value="faqs">FAQs</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Essential product details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input id="title" {...register("title")} placeholder="Enter product title" />
                    {errors.title && (
                      <p className="text-sm text-destructive">{errors.title.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input id="slug" {...register("slug")} placeholder="product-slug" />
                    {errors.slug && (
                      <p className="text-sm text-destructive">{errors.slug.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hsnCode">HSN Code</Label>
                    <Input id="hsnCode" {...register("hsnCode")} placeholder="Enter HSN code" />
                    {errors.hsnCode && (
                      <p className="text-sm text-destructive">{errors.hsnCode.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Short Description</Label>
                    <Input
                      id="shortDescription"
                      {...register("shortDescription")}
                      placeholder="Brief description for product cards"
                    />
                    {errors.shortDescription && (
                      <p className="text-sm text-destructive">{errors.shortDescription.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Full Description *</Label>
                    <Textarea
                      id="description"
                      {...register("description")}
                      placeholder="Enter detailed product description"
                      rows={8}
                    />
                    {errors.description && (
                      <p className="text-sm text-destructive">{errors.description.message}</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Product Variants */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Product Variants
                  </CardTitle>
                  <CardDescription>
                    Each variant has its own price, stock, and images
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {variantFields.map((field, index) => (
                    <Card key={field.id} className="border-2 relative">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">Variant #{index + 1}</CardTitle>
                          {variantFields.length > 1 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeVariant(index)}
                              disabled={isLoading}
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`variants.${index}.name`}>Variant Name *</Label>
                            <Input
                              id={`variants.${index}.name`}
                              {...register(`variants.${index}.name`)}
                              placeholder="e.g., Default, Large, Red, 500g"
                              disabled={isLoading}
                            />
                            {errors.variants?.[index]?.name && (
                              <p className="text-sm text-destructive">
                                {errors.variants[index]?.name?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`variants.${index}.sku`}>SKU (Optional)</Label>
                            <Input
                              id={`variants.${index}.sku`}
                              {...register(`variants.${index}.sku`)}
                              placeholder="Stock Keeping Unit"
                              disabled={isLoading}
                            />
                            {errors.variants?.[index]?.sku && (
                              <p className="text-sm text-destructive">
                                {errors.variants[index]?.sku?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`variants.${index}.mrp`}>MRP *</Label>
                            <Input
                              id={`variants.${index}.mrp`}
                              type="number"
                              step="0.01"
                              {...register(`variants.${index}.mrp`, { valueAsNumber: true })}
                              placeholder="0.00"
                              disabled={isLoading}
                            />
                            {errors.variants?.[index]?.mrp && (
                              <p className="text-sm text-destructive">
                                {errors.variants[index]?.mrp?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`variants.${index}.sellingPrice`}>Selling Price *</Label>
                            <Input
                              id={`variants.${index}.sellingPrice`}
                              type="number"
                              step="0.01"
                              {...register(`variants.${index}.sellingPrice`, { valueAsNumber: true })}
                              placeholder="0.00"
                              disabled={isLoading}
                            />
                            {errors.variants?.[index]?.sellingPrice && (
                              <p className="text-sm text-destructive">
                                {errors.variants[index]?.sellingPrice?.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`variants.${index}.stock`}>Stock Quantity *</Label>
                            <Input
                              id={`variants.${index}.stock`}
                              type="number"
                              {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                              placeholder="0"
                              disabled={isLoading}
                            />
                            {errors.variants?.[index]?.stock && (
                              <p className="text-sm text-destructive">
                                {errors.variants[index]?.stock?.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="space-y-2 mt-4 border rounded-md p-4 bg-muted/20">
                          <Label>Variant Images</Label>
                          <Controller
                            control={control}
                            name={`variants.${index}.images`}
                            render={({ field: imageField }) => (
                              <MediaSection
                                media={imageField.value || []}
                                onChange={(newMedia) => imageField.onChange(newMedia)}
                                maxFiles={5}
                                maxSizeMB={5}
                              />
                            )}
                          />
                        </div>
                        
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`variants.${index}.sortOrder`}>Sort Order</Label>
                            <Input
                              id={`variants.${index}.sortOrder`}
                              type="number"
                              {...register(`variants.${index}.sortOrder`, { valueAsNumber: true })}
                              placeholder="0"
                              disabled={isLoading}
                            />
                          </div>
                          <div className="flex items-center space-x-2 pt-8">
                            <Controller
                              name={`variants.${index}.isActive`}
                              control={control}
                              render={({ field: activeField }) => (
                                <Switch
                                  id={`variants.${index}.isActive`}
                                  checked={activeField.value}
                                  onCheckedChange={activeField.onChange}
                                />
                              )}
                            />
                            <Label htmlFor={`variants.${index}.isActive`}>Active</Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      appendVariant({
                        name: `Variant ${variantFields.length + 1}`,
                        sku: "",
                        images: [],
                        mrp: 0,
                        sellingPrice: 0,
                        stock: 0,
                        isActive: true,
                        sortOrder: variantFields.length,
                      })
                    }
                    className="w-full"
                    disabled={isLoading}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Variant
                  </Button>
                  {errors.variants && typeof errors.variants.message === "string" && (
                    <p className="text-sm text-destructive">{errors.variants.message}</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="sections" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Dynamic Content Sections</CardTitle>
                  <CardDescription>
                    Add custom sections like text blocks, bullet lists, or specifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Controller
                    control={control}
                    name="sections"
                    render={({ field }) => (
                      <SectionEditor sections={field.value} onChange={field.onChange} />
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="faqs" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Product FAQs</CardTitle>
                  <CardDescription>
                    Add frequently asked questions about this product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Controller
                    control={control}
                    name="faqs"
                    render={({ field }) => (
                      <FaqEditor faqs={field.value} onChange={field.onChange} />
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          {/* Product Status */}
          <Card>
            <CardHeader>
              <CardTitle>Product Status</CardTitle>
              <CardDescription>Control product visibility and flags</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id="isActive" />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured Product</Label>
                <Controller
                  name="isFeatured"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isFeatured"
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isBestSeller">Best Seller</Label>
                <Controller
                  name="isBestSeller"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isBestSeller"
                    />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isOnSale">On Sale</Label>
                <Controller
                  name="isOnSale"
                  control={control}
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} id="isOnSale" />
                  )}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="isNewArrival">New Arrival</Label>
                <Controller
                  name="isNewArrival"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      id="isNewArrival"
                    />
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
              <CardDescription>Select product category (optional)</CardDescription>
            </CardHeader>
            <CardContent>
              <Controller
                name="categoryId"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={(value) => {
                      if (value === "__uncategorized__") {
                        field.onChange(null);
                      } else {
                        field.onChange(value);
                      }
                    }}
                    value={field.value || "__uncategorized__"}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Uncategorized" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__uncategorized__">🗂️ Uncategorized</SelectItem>
                      {hierarchicalCategories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          <span style={{ paddingLeft: `${category.level * 16}px` }}>
                            {category.level > 0 ? "└─ " : "📁 "}
                            {category.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.categoryId && (
                <p className="text-sm text-destructive mt-2">{errors.categoryId.message}</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
