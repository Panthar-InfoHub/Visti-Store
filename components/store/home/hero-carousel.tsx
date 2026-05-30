"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import type { HeroSlide } from "@/prisma/generated/prisma";

interface HeroCarouselProps {
  slides: HeroSlide[];
}

export function HeroCarousel({ slides }: HeroCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const activeSlides = slides.filter((slide) => slide.isActive);

  const nextSlide = useCallback(() => {
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  }, [activeSlides.length]);

  const prevSlide = () => {
    if (activeSlides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    if (!isAutoPlaying || activeSlides.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, nextSlide, activeSlides.length]);

  // Empty state - no slides
  if (activeSlides.length === 0) {
    return (
      <div className="relative w-full overflow-hidden bg-gray-50 border-b">
        <div className="relative h-[300px] md:h-[400px]">
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 px-4">
              <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <ImageOff className="h-10 w-10 text-gray-400" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No Hero Slides Available
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Hero carousel is currently empty. Check back soon for featured content!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[96vw] mx-auto px-2 sm:px-4 py-2 md:py-4">
      {/* Hero Carousel Container - Boxed with rounded corners and controlled aspect ratio */}
      <div className="relative overflow-hidden rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] aspect-[16/10] sm:aspect-[16/9] md:aspect-[21/9] lg:aspect-[24/10] w-full shadow-lg group">
        {activeSlides.map((slide, index) => {
          const slideContent = (
            <div className="relative w-full h-full cursor-pointer overflow-hidden">
              <Image
                src={slide.image}
                alt={slide.imageAlt || "Hero banner"}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 85vw"
                priority={index === 0}
              />
              {/* Optional Content Overlay */}
              {(slide.title || slide.description || slide.buttonText) && (
                <div className="absolute inset-0 bg-black/35 flex flex-col items-center justify-center text-center p-4 sm:p-6 md:p-8 z-10 select-none">
                  {slide.title && (
                    <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-normal tracking-wide text-white mb-2 sm:mb-3">
                      {slide.title}
                    </h2>
                  )}
                  {slide.description && (
                    <p className="text-[10px] sm:text-sm md:text-base text-white/90 max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl mx-auto leading-relaxed mb-4 sm:mb-6">
                      {slide.description}
                    </p>
                  )}
                  {slide.buttonText && (
                    <div className="mt-2">
                      <span className="inline-block bg-[#c29f80] hover:bg-[#b08e6f] text-white text-[10px] sm:text-xs md:text-sm font-semibold tracking-widest px-5 py-2.5 md:px-8 md:py-3.5 rounded transition-all uppercase shadow-md duration-300">
                        {slide.buttonText}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 h-full w-full ${
                index === currentSlide
                  ? "opacity-100 pointer-events-auto"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              {slide.buttonLink ? (
                <Link href={slide.buttonLink} className="block w-full h-full">
                  {slideContent}
                </Link>
              ) : (
                slideContent
              )}
            </div>
          );
        })}

        {/* Navigation Arrows - Only show if more than 1 slide */}
        {activeSlides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white text-white hover:text-gray-800 p-2.5 sm:p-3 rounded-full shadow-lg transition-all duration-300 backdrop-blur-xs opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white text-white hover:text-gray-800 p-2.5 sm:p-3 rounded-full shadow-lg transition-all duration-300 backdrop-blur-xs opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center cursor-pointer"
              aria-label="Next slide"
            >
              <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>

            {/* Dots Indicator */}
            <div className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
              {activeSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === currentSlide
                      ? "w-8 bg-white"
                      : "w-2 bg-white/50 hover:bg-white"
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
