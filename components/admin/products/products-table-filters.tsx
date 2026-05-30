"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Package } from "lucide-react";
import { useTransition, useRef, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface ProductsTableFiltersProps {
  totalProducts: number;
  categories: Array<{ id: string; name: string }>;
}

export function ProductsTableFilters({ totalProducts, categories }: ProductsTableFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateFilters = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams);
      if (value && value !== "all") {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");

      startTransition(() => {
        router.push(`?${params.toString()}`);
      });
    },
    [searchParams, router]
  );

  const debouncedSearch = useCallback(
    (value: string) => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }

      searchTimeoutRef.current = setTimeout(() => {
        updateFilters("search", value);
      }, 500);
    },
    [updateFilters]
  );

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                defaultValue={searchParams.get("search") || ""}
                onChange={(e) => debouncedSearch(e.target.value)}
                className="pl-9"
                disabled={isPending}
              />
            </div>

            {/* Category Filter */}
            <Select
              defaultValue={searchParams.get("category") || "all"}
              onValueChange={(value) => updateFilters("category", value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Stock Status Filter */}
            <Select
              defaultValue={searchParams.get("status") || "all"}
              onValueChange={(value) => updateFilters("status", value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Stock Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="in-stock">In Stock</SelectItem>
                <SelectItem value="out-of-stock">Out of Stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Featured Filter */}
            <Select
              defaultValue={searchParams.get("featured") || "all"}
              onValueChange={(value) => updateFilters("featured", value)}
              disabled={isPending}
            >
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Special" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="bestseller">Best Seller</SelectItem>
                <SelectItem value="sale">On Sale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Total Count */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Package className="h-4 w-4" />
            <span className="font-medium">{totalProducts}</span>
            <span>products found</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
