import { formatPrice } from "@/utils/format";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { getProducts } from "@/actions/admin/product.actions";

export async function TopProducts() {
  const result = await getProducts({ isBestSeller: true });
  const topProducts = result.success ? (result.data || []).slice(0, 5) : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Products</CardTitle>
        <CardDescription>Best selling products this month</CardDescription>
      </CardHeader>
      <CardContent>
        {topProducts.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No best seller products found. Mark products as best sellers to see them here.
          </p>
        ) : (
          <div className="space-y-4">
            {topProducts.map((product, index) => {
              const primaryVariant = product.variants?.[0];
              const price = primaryVariant?.sellingPrice || 0;
              const image = primaryVariant?.images?.[0] || "/placeholder.svg";

              return (
                <div key={product.id} className="flex items-center gap-4 group">
                  <div
                    className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                      index === 0
                        ? "bg-yellow-100 text-yellow-700"
                        : index === 1
                        ? "bg-gray-100 text-gray-700"
                        : index === 2
                        ? "bg-orange-100 text-orange-700"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {index + 1}
                  </div>
                  <div className="relative w-12 h-12 bg-muted rounded-lg overflow-hidden shrink-0 group-hover:ring-2 ring-primary transition-all">
                    <Image
                      src={image}
                      alt={product.title}
                      fill
                      sizes="48px"
                      className="object-contain p-1"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.title}</p>
                    <p className="text-sm text-muted-foreground">{product.category?.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatPrice(price)}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      Best Seller
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
