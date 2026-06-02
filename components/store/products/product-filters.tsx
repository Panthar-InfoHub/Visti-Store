"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/site.config";

interface ProductFiltersProps {
  categories: {
    id: string;
    name: string;
    slug: string;
    children?: { id: string; name: string; slug: string }[];
  }[];
  isMobile?: boolean;
}

export function ProductFilters({ categories, isMobile = false }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") || "";
  const currentInStock = searchParams.get("inStock") === "true";
  const currentMinPrice = searchParams.get("minPrice");
  const currentMaxPrice = searchParams.get("maxPrice");

  const MAX_PRICE = 500000; // 5 lakhs max

  const [priceRange, setPriceRange] = useState([
    currentMinPrice ? parseInt(currentMinPrice) : 0,
    currentMaxPrice ? parseInt(currentMaxPrice) : MAX_PRICE,
  ]);

  const updateFilters = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === null || value === "") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    router.push(`/products?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (priceRange[0] > 0) {
      params.set("minPrice", priceRange[0].toString());
    } else {
      params.delete("minPrice");
    }

    if (priceRange[1] < MAX_PRICE) {
      params.set("maxPrice", priceRange[1].toString());
    } else {
      params.delete("maxPrice");
    }

    router.push(`/products?${params.toString()}`);
  };

  const clearAllFilters = () => {
    setPriceRange([0, MAX_PRICE]);
    router.push("/products");
  };

  const hasActiveFilters =
    currentCategory ||
    currentInStock ||
    searchParams.get("minPrice") ||
    searchParams.get("maxPrice");

  const activeFilterCount = [
    currentCategory,
    currentInStock,
    searchParams.get("minPrice") || searchParams.get("maxPrice"),
  ].filter(Boolean).length;

  // Helper function to find category name (including nested)
  const getCategoryName = (slug: string) => {
    for (const cat of categories) {
      if (cat.slug === slug) return cat.name;
      if (cat.children) {
        const child = cat.children.find(c => c.slug === slug);
        if (child) return child.name;
      }
    }
    return slug;
  };

  return (
    <div className={`bg-white ${!isMobile ? 'rounded-lg border border-gray-200 p-6 sticky top-4' : 'p-4'} space-y-6`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5" style={{ color: siteConfig.colors.secondary }} />
          <h3 
            className="font-semibold text-lg"
            style={{ color: siteConfig.colors.secondary }}
          >
            Filters
          </h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {hasActiveFilters && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearAllFilters} 
            className="text-xs"
            style={{ color: siteConfig.colors.primary }}
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pb-4 border-b border-gray-100">
          {currentCategory && (
            <Badge variant="default" className="gap-1">
              {getCategoryName(currentCategory)}
              <X
                className="h-3 w-3 cursor-pointer hover:text-white"
                onClick={() => updateFilters("category", null)}
              />
            </Badge>
          )}
          {currentInStock && (
            <Badge variant="default" className="gap-1">
              In Stock
              <X
                className="h-3 w-3 cursor-pointer hover:text-white"
                onClick={() => updateFilters("inStock", null)}
              />
            </Badge>
          )}
          {(searchParams.get("minPrice") || searchParams.get("maxPrice")) && (
            <Badge variant="default" className="gap-1">
              ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
              <X
                className="h-3 w-3 cursor-pointer hover:text-white"
                onClick={() => {
                  setPriceRange([0, MAX_PRICE]);
                  const params = new URLSearchParams(searchParams.toString());
                  params.delete("minPrice");
                  params.delete("maxPrice");
                  router.push(`/products?${params.toString()}`);
                }}
              />
            </Badge>
          )}
        </div>
      )}

      {/* Categories */}
      <div>
        <h4 
          className="font-medium mb-3 text-sm"
          style={{ color: siteConfig.colors.secondary }}
        >
          Category
        </h4>
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="all-categories"
              checked={!currentCategory}
              onCheckedChange={() => updateFilters("category", null)}
            />
            <Label
              htmlFor="all-categories"
              className={`text-sm cursor-pointer ${!currentCategory ? 'font-medium' : 'font-normal'}`}
              style={{ color: !currentCategory ? siteConfig.colors.quaternary : siteConfig.colors.secondary }}
            >
              All Categories
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="space-y-2">
              {/* Parent Category */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={category.slug}
                  checked={currentCategory === category.slug}
                  onCheckedChange={(checked) => {
                    updateFilters("category", checked ? category.slug : null);
                  }}
                />
                <Label
                  htmlFor={category.slug}
                  className={`text-sm cursor-pointer ${currentCategory === category.slug ? 'font-medium' : 'font-normal'}`}
                  style={{ color: currentCategory === category.slug ? siteConfig.colors.quaternary : siteConfig.colors.secondary }}
                >
                  {category.name}
                </Label>
              </div>

              {/* Child Categories */}
              {category.children && category.children.length > 0 && (
                <div className="ml-6 space-y-2 border-l-2 border-gray-100 pl-3">
                  {category.children.map((child) => (
                    <div key={child.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={child.slug}
                        checked={currentCategory === child.slug}
                        onCheckedChange={(checked) => {
                          updateFilters("category", checked ? child.slug : null);
                        }}
                      />
                      <Label
                        htmlFor={child.slug}
                        className={`text-xs cursor-pointer ${currentCategory === child.slug ? 'font-medium' : 'font-normal'}`}
                        style={{ color: currentCategory === child.slug ? siteConfig.colors.secondary : siteConfig.colors.primary }}
                      >
                        {child.name}
                      </Label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 
          className="font-medium mb-3 text-sm"
          style={{ color: siteConfig.colors.secondary }}
        >
          Price Range
        </h4>
        <div className="space-y-4">
          <div className="px-1">
            <Slider
              min={0}
              max={MAX_PRICE}
              step={1000}
              value={priceRange}
              onValueChange={setPriceRange}
              className="cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
              <span className="text-xs" style={{ color: siteConfig.colors.secondary }}>Min</span>
              <p className="text-sm font-semibold" style={{ color: siteConfig.colors.primary }}>₹{priceRange[0].toLocaleString()}</p>
            </div>
            <div className="text-gray-400">—</div>
            <div className="bg-gray-50 px-3 py-2 rounded-md border border-gray-200">
              <span className="text-xs" style={{ color: siteConfig.colors.secondary }}>Max</span>
              <p className="text-sm font-semibold" style={{ color: siteConfig.colors.primary }}>₹{priceRange[1].toLocaleString()}</p>
            </div>
          </div>
          <Button
            size="sm"
            className="w-full text-white hover:opacity-90"
            onClick={applyPriceFilter}
            style={{ backgroundColor: siteConfig.colors.tertiary }}
          >
            Apply Price Filter
          </Button>
        </div>
      </div>

      {/* Availability */}
      <div>
        <h4 
          className="font-medium mb-3 text-sm"
          style={{ color: siteConfig.colors.secondary }}
        >
          Availability
        </h4>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="in-stock"
            checked={currentInStock}
            onCheckedChange={(checked) => {
              updateFilters("inStock", checked ? "true" : null);
            }}
          />
          <Label
            htmlFor="in-stock"
            className={`text-sm cursor-pointer ${currentInStock ? 'font-medium' : 'font-normal'}`}
            style={{ color: currentInStock ? siteConfig.colors.secondary : siteConfig.colors.primary }}
          >
            In Stock Only
          </Label>
        </div>
        <p 
          className="text-xs mt-1.5 ml-6"
          style={{ color: siteConfig.colors.primary }}
        >
          Show only products available for purchase
        </p>
      </div>
    </div>
  );
}
