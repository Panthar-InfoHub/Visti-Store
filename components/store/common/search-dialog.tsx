"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Loader2, Folder, Package, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { searchPreview, SearchPreviewResult } from "@/actions/store/search.actions";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/utils/format";
import { ScrollArea } from "@/components/ui/scroll-area";

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchPreviewResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Debounced search with useCallback
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout;
      return (query: string) => {
        clearTimeout(timeoutId);
        if (query.trim().length < 2) {
          setResults(null);
          setIsLoading(false);
          return;
        }
        setIsLoading(true);
        timeoutId = setTimeout(async () => {
          try {
            const data = await searchPreview(query);
            setResults(data);
          } catch (error) {
            console.error("Search error:", error);
          } finally {
            setIsLoading(false);
          }
        }, 300); // 300ms debounce
      };
    })(),
    []
  );

  // Handle search input change
  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults(null);
      setIsLoading(false);
    }
  }, [open]);

  const handleViewAll = () => {
    if (searchQuery.trim()) {
      setOpen(false);
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleCategoryClick = (slug: string) => {
    setOpen(false);
    router.push(`/categories/${slug}`);
  };

  const handleProductClick = (slug: string) => {
    setOpen(false);
    router.push(`/products/${slug}`);
  };

  const hasResults = results && (results.categories.length > 0 || results.products.length > 0);
  const showEmpty = searchQuery.trim().length >= 2 && !isLoading && results && !hasResults;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <Search className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-w-[95vw] p-0 max-h-[90vh] flex flex-col">
        <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b flex-shrink-0">
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-4 sm:px-6 pb-3 sm:pb-4 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search products, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4"
              autoFocus
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
            )}
          </div>
        </div>

        {/* Results */}
        <ScrollArea className="flex-1 overflow-auto">
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            {/* Categories Section */}
            {hasResults && results.categories.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Folder className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold text-sm text-gray-700">Categories</h3>
                  {results.totalCategories > 3 && (
                    <span className="text-xs text-gray-500">({results.totalCategories} total)</span>
                  )}
                </div>
                <div className="space-y-2">
                  {results.categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.slug)}
                      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-gray-900 flex items-center justify-center flex-shrink-0">
                          <Folder className="h-5 w-5 text-white" />
                        </div>
                        <div className="text-left min-w-0">
                          <p className="font-medium text-sm text-gray-900 truncate">{category.name}</p>
                          <p className="text-xs text-gray-500">{category.productCount} products</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Products Section */}
            {hasResults && results.products.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Package className="h-4 w-4 text-gray-500" />
                  <h3 className="font-semibold text-sm text-gray-700">Products</h3>
                  {results.totalProducts > 3 && (
                    <span className="text-xs text-gray-500">({results.totalProducts} total)</span>
                  )}
                </div>
                <div className="space-y-2">
                  {results.products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => handleProductClick(product.slug)}
                      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                        {product.images[0] ? (
                          <Image
                            src={product.images[0]}
                            alt={product.title}
                            width={64}
                            height={64}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-300" />
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
                        <div className="flex items-center gap-2 mt-1">
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
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* View All Button */}
            {hasResults && (results.totalProducts > 3 || results.totalCategories > 3) && (
              <Button onClick={handleViewAll} className="w-full mt-4" variant="outline">
                View All Results
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {/* Empty State */}
            {showEmpty && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-1">No results found</p>
                <p className="text-sm text-gray-500">Try searching with different keywords</p>
              </div>
            )}

            {/* Initial State */}
            {!searchQuery.trim() && (
              <div className="text-center py-12">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-900 font-medium mb-1">Start typing to search</p>
                <p className="text-sm text-gray-500">Search for products, categories, and more</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
