"use client";

import { ModernProductCard } from "@/components/store/products/modern-product-card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

interface ProductCarouselProps {
  products: Array<{
    id: string;
    title: string;
    slug: string;
    shortDescription: string | null;
    variants: Array<{
      id: string;
      name: string;
      sku: string | null;
      images: string[];
      mrp: number;
      sellingPrice: number;
      stock: number;
      isActive: boolean;
      sortOrder: number;
      createdAt: Date;
    }>;
    isFeatured?: boolean;
    isBestSeller?: boolean;
    isNewArrival?: boolean;
    isOnSale?: boolean;
  }>;
}

export function ProductCarousel({ products }: ProductCarouselProps) {
  return (
    <div className="relative">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
          duration: 40,
        }}
        plugins={[
          Autoplay({
            delay: 2000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
            playOnInit: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-3 md:-ml-4">
          {products.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-3 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
            >
              <ModernProductCard product={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
