"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Loader2 } from "lucide-react";
import Image from "next/image";
import { DeleteConfirmDialog } from "@/components/admin/shared/delete-confirm-dialog";
import {
  getCategories,
  deleteCategory,
  getCategoryDeletionInfo,
} from "@/actions/admin/category.actions";
import { toast } from "sonner";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  productCount: number;
  isActive: boolean;
  parentId: string | null;
  parent?: Category | null;
  children?: Category[];
}

interface DeletionImpact {
  childrenCount: number;
  directProducts: number;
  totalAffectedProducts: number;
  categoryName: string;
}

export function CategoriesTable() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [deletionImpact, setDeletionImpact] = useState<DeletionImpact | null>(null);
  const [isCheckingImpact, setIsCheckingImpact] = useState(false);

  const fetchCategories = async () => {
    setIsLoading(true);
    const result = await getCategories();
    if (result.success && result.data) {
      setCategories(result.data as any);
    } else {
      toast.error(result.error || "Failed to fetch categories");
    }
    setIsLoading(false);
  };

  // Build hierarchical category tree
  const buildCategoryTree = (cats: Category[]): Category[] => {
    const map = new Map<string, Category>();
    const roots: Category[] = [];

    // First pass: create map
    cats.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
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
    tree: Category[],
    level = 0,
    result: Array<Category & { level: number }> = []
  ): Array<Category & { level: number }> => {
    tree.forEach((cat) => {
      result.push({ ...cat, level });
      if (cat.children && cat.children.length > 0) {
        flattenTree(cat.children, level + 1, result);
      }
    });
    return result;
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: Category) => {
    router.push(`/admin/categories/${category.slug}`);
  };

  const handleDelete = async (category: Category) => {
    setCategoryToDelete(category);
    setIsCheckingImpact(true);
    setIsDeleteOpen(true);

    // Check deletion impact
    const impactResult = await getCategoryDeletionInfo(category.id);
    if (impactResult.success && impactResult.data) {
      setDeletionImpact(impactResult.data as any);
    }
    setIsCheckingImpact(false);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;

    const result = await deleteCategory(categoryToDelete.id, {
      moveProductsToUncategorized: true,
    });

    if (result.success) {
      toast.success(result.message || "Category deleted successfully");
      fetchCategories();
      setIsDeleteOpen(false);
      setCategoryToDelete(null);
      setDeletionImpact(null);
    } else {
      toast.error(result.error || "Failed to delete category");
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">Loading categories...</p>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center">
        <p className="text-muted-foreground">
          No categories found. Create your first category to get started.
        </p>
      </div>
    );
  }

  // Build and flatten tree for display
  const tree = buildCategoryTree(categories);
  const flatCategories = flattenTree(tree);

  return (
    <>
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-20">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead className="text-center">Products</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-20">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {flatCategories.map((category) => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                    <Image
                      src={category.image || "/placeholder.svg"}
                      alt={category.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {/* Indentation for nested categories */}
                    <span
                      style={{ marginLeft: `${category.level * 24}px` }}
                      className="flex items-center gap-2"
                    >
                      {category.level > 0 && (
                        <span className="text-muted-foreground text-xs">└─</span>
                      )}
                      <span>{category.name}</span>
                    </span>
                  </div>
                  {category.children && category.children.length > 0 && (
                    <span className="text-xs text-muted-foreground ml-2">
                      ({category.children.length} subcategories)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary">{category.productCount}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={category.isActive ? "outline" : "secondary"}>
                    {category.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(category)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(category)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) {
            setCategoryToDelete(null);
            setDeletionImpact(null);
          }
        }}
        onConfirm={confirmDelete}
        isLoading={isCheckingImpact}
        title="Delete Category"
        description={
          <div className="space-y-3">
            <p>
              Are you sure you want to delete <strong>"{categoryToDelete?.name}"</strong>?
            </p>
            {isCheckingImpact ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Checking deletion impact...</span>
              </div>
            ) : (
              deletionImpact && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="space-y-2">
                    <p className="font-semibold">This action will:</p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {deletionImpact.childrenCount > 0 && (
                        <li>
                          Delete <strong>{deletionImpact.childrenCount}</strong> subcategories
                        </li>
                      )}
                      <li>
                        Move <strong>{deletionImpact.totalAffectedProducts}</strong> products to
                        "Uncategorized"
                        {deletionImpact.directProducts > 0 && (
                          <span className="text-xs">
                            {" "}
                            ({deletionImpact.directProducts} directly in this category)
                          </span>
                        )}
                      </li>
                    </ul>
                    <p className="text-xs mt-2 text-orange-600">⚠️ This action cannot be undone!</p>
                  </AlertDescription>
                </Alert>
              )
            )}
          </div>
        }
      />
    </>
  );
}
