"use client";

import { TrendingUp } from "lucide-react";
import Image from "next/image";

interface TopProductsListProps {
  products: Array<{
    id: string;
    title: string;
    sales: number;
    orders: number;
    image: string;
    category: string;
  }>;
}

export function TopProductsList({ products }: TopProductsListProps) {
  return (
    <div className="rounded-xl border bg-card p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Top Products</h3>
        <p className="text-sm text-muted-foreground mt-1">Best selling items</p>
      </div>
      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product, index) => (
            <div
              key={product.id}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
            >
              {/* Rank Number - Simple */}
              <div className="shrink-0 w-8 flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground group-hover:text-foreground transition-colors">
                  {index + 1}
                </span>
              </div>

              {/* Product Image */}
              <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-muted shrink-0">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm truncate leading-tight">{product.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5">{product.category}</p>
              </div>

              {/* Stats */}
              <div className="text-right shrink-0 min-w-[70px]">
                <div className="font-semibold text-sm whitespace-nowrap">{product.sales} sold</div>
                <div className="text-xs text-muted-foreground mt-0.5">{product.orders} orders</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center h-[200px] text-muted-foreground">
          No product data available
        </div>
      )}
    </div>
  );
}
