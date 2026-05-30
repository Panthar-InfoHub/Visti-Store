"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, ChevronRight, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { searchPreview, SearchPreviewResult } from "@/actions/store/search.actions";
import Image from "next/image";
import { formatPrice } from "@/utils/format";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export function ExpandedSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Debounced search
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        if (query.trim().length < 2) {
          setResults(null);
          setIsLoading(false);
          setShowDropdown(false);
          return;
        }
        setIsLoading(true);
        setShowDropdown(true);
        timeoutId = setTimeout(async () => {
          try {
            const data = await searchPreview(query);
            setResults(data);
          } catch (error) {
            console.error("Search error:", error);
          } finally {
            setIsLoading(false);
          }
        }, 300);
      };
    })(),
    []
  );

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleViewAll = () => {
    if (searchQuery.trim()) {
      setShowDropdown(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (slug: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/categories/${slug}`);
  };

  const handleProductClick = (slug: string) => {
    setShowDropdown(false);
    setSearchQuery("");
    router.push(`/products/${slug}`);
  };

  const hasResults = results && (results.categories.length > 0 || results.products.length > 0);

  return (
    <div ref={wrapperRef} className="relative flex-1 max-w-xl">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
        <Input
          type="text"
          placeholder="Search products, categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => searchQuery.trim().length >= 2 && setShowDropdown(true)}
          className="pl-10 pr-10 h-10 bg-white"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2  rounded-lg shadow-xl border z-50 max-h-[600px] w-full min-w-md bg-white overflow-hidden">
          <ScrollArea className="max-h-[550px] w-full">
            <div className="p-4">
              {/* Categories - List Format */}
              {hasResults && results.categories.length > 0 && (
                <div className="mb-4">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
                    Categories {results.totalCategories > 3 && `(${results.totalCategories})`}
                  </h3>
                  <div className="space-y-1">
                    {results.categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.slug)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-50 transition-colors group text-left"
                      >
                        <div>
                          <p className="font-medium text-sm text-gray-900 group-hover:text-blue-600">
                            {category.name}
                          </p>
                          <p className="text-xs text-gray-500">{category.productCount} products</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {hasResults && results.products.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">
                    Products {results.totalProducts > 3 && `(${results.totalProducts})`}
                  </h3>
                  <div className="space-y-1">
                    {results.products.map((product) => (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product.slug)}
                        className="w-full flex items-center gap-3 p-2 rounded-md hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                          {product.images[0] ? (
                            <Image
                              src={product.images[0]}
                              alt={product.title}
                              width={48}
                              height={48}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-gray-300" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">
                            {product.title}
                          </p>
                          {product.category && (
                            <p className="text-xs text-gray-500 truncate">
                              in {product.category.name}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-semibold text-sm text-gray-900">
                              {formatPrice(product.sellingPrice)}
                            </span>
                            {product.mrp > product.sellingPrice && (
                              <span className="text-xs text-gray-500 line-through">
                                {formatPrice(product.mrp)}
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* View All */}
              {hasResults && (results.totalProducts > 3 || results.totalCategories > 3) && (
                <Button onClick={handleViewAll} className="w-full mt-3" size="sm" variant="outline">
                  View All Results
                </Button>
              )}

              {/* Empty State */}
              {searchQuery.trim().length >= 2 && !isLoading && !hasResults && (
                <div className="text-center py-8">
                  <p className="text-gray-500 text-sm">No results found</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
