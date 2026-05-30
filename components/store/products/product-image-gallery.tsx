"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/hooks/use-wishlist";

interface ProductImageGalleryProps {
  images: string[];
  title: string;
  productId?: string;
}

export function ProductImageGallery({ images, title, productId }: ProductImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { isInWishlist, toggleItem, isProductLoading: isWishlistLoading } = useWishlist();

  const inWishlist = productId ? isInWishlist(productId) : false;
  const isTogglingWishlist = productId ? isWishlistLoading(productId) : false;

  const isVideo = (url: string) => {
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!productId) return;
    try {
      await toggleItem(productId);
    } catch (error) {
      // already handled
    }
  };

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-gray-200 rounded-[32px] flex items-center justify-center">
        <span className="text-gray-400">No image available</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Image */}
      <div className="relative aspect-square bg-[#f4f4f4] rounded-[32px] overflow-hidden group shadow-sm transition-all duration-300">
        {isVideo(images[currentIndex]) ? (
          <video
            src={images[currentIndex]}
            controls
            autoPlay
            muted
            loop
            className="w-full h-full object-contain"
          />
        ) : (
          <Image
            src={images[currentIndex]}
            alt={`${title} - Image ${currentIndex + 1}`}
            fill
            className="object-cover p-0"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={currentIndex === 0}
          />
        )}

        {/* Wishlist Overlay Button */}
        {productId && (
          <button
            onClick={handleWishlistToggle}
            disabled={isTogglingWishlist}
            className="absolute top-6 right-6 z-20 w-11 h-11 bg-white hover:bg-gray-50 active:scale-95 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 group/btn border border-gray-100 disabled:opacity-50"
            aria-label="Toggle Wishlist"
          >
            {isTogglingWishlist ? (
              <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
            ) : (
              <Heart
                className={`w-5 h-5 transition-all duration-250 ${
                  inWishlist
                    ? "fill-red-500 text-red-500 scale-110"
                    : "text-[#555555] group-hover/btn:text-red-500"
                }`}
              />
            )}
          </button>
        )}

        {images.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-full w-10 h-10 shadow-md bg-white/90 hover:bg-white border border-gray-100"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="absolute right-6 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 rounded-full w-10 h-10 shadow-md bg-white/90 hover:bg-white border border-gray-100"
              onClick={goToNext}
            >
              <ChevronRight className="h-5 w-5 text-gray-700" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnail Grid */}
      <div className="grid grid-cols-4 gap-4">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`relative aspect-square rounded-[20px] overflow-hidden border-2 transition-all duration-200 ${
              index === currentIndex
                ? "border-[#234338] ring-2 ring-[#234338]/10"
                : "border-transparent bg-[#f4f4f4] hover:border-gray-300"
            }`}
          >
            {isVideo(image) ? (
              <div className="relative w-full h-full bg-gray-100">
                <video
                  src={image}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                  <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                    <div className="w-0 h-0 border-t-[4px] border-t-transparent border-l-[6px] border-l-gray-900 border-b-[4px] border-b-transparent ml-0.5" />
                  </div>
                </div>
              </div>
            ) : (
              <Image
                src={image}
                alt={`${title} - Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
