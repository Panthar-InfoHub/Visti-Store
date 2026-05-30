"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Camera, ChevronsLeftRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/site.config";

export function VisualizeSection() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(0, Math.min((x / rect.width) * 100, 100));
    setSliderPosition(percent);
  };

  return (
    <section className="py-16 md:py-24 bg-[#faf9f6]">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Content */}
          <div className="max-w-xl">
            <p 
              className="font-bold text-xs tracking-[0.15em] uppercase mb-4"
              style={{ color: siteConfig.colors.primary }}
            >
              AI Interior Designer
            </p>
            <h2 
              className="text-4xl md:text-5xl lg:text-[52px] font-medium mb-6 leading-[1.15] tracking-tight"
              style={{ color: siteConfig.colors.secondary }}
            >
              Visualize in Your Space
            </h2>
            <p 
              className="text-lg md:text-xl mb-10 leading-relaxed font-light"
              style={{ color: siteConfig.colors.secondary }}
            >
              Experience the future of interior design. Upload a photo of your room
              and see instantly how Aura's curated pieces transform your home with
              quiet luxury and timeless elegance.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <Button 
                asChild 
                size="lg" 
                className="text-white px-8 h-12 text-xs tracking-widest uppercase font-semibold rounded-none hover:opacity-90"
                style={{ backgroundColor: siteConfig.colors.primary }}
              >
                <Link href="https://spzaora.com" target="_blank" rel="noopener noreferrer">
                  <Camera className="mr-2 h-4 w-4" />
                  Upload Photo
                </Link>
              </Button>
              <Button 
                asChild 
                variant="outline" 
                size="lg"
                className="border-[#d4d4d4] text-[#6b6b6b] hover:bg-white hover:text-black px-8 h-12 text-xs tracking-widest uppercase font-semibold rounded-none bg-transparent"
              >
                {/* <Link href="#">
                  Learn More
                </Link> */}
              </Button>
            </div>
          </div>

          {/* Right Interactive Slider */}
          <div 
            className="relative w-full select-none overflow-hidden cursor-ew-resize bg-transparent rounded-lg" 
            ref={containerRef}
            onMouseMove={(e) => handleMove(e.clientX)}
            onTouchMove={(e) => handleMove(e.touches[0].clientX)}
          >
            
            {/* After Image (Base) - Natural height to prevent cropping */}
            <Image 
              src="/image/after-image.png"
              alt="After interior design"
              width={800}
              height={1200}
              className="w-full h-auto pointer-events-none"
              priority
            />
            
            {/* Before Image (Top layer, clipped) */}
            <div 
              className="absolute inset-0 w-full h-full"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <Image 
                src="/image/before-image.png"
                alt="Before interior design"
                fill
                className="object-cover pointer-events-none"
                priority
              />
              <div className="absolute top-8 left-8 px-4 py-1.5 text-white/90 text-[10px] tracking-[0.2em] uppercase font-bold z-10">
                Before
              </div>
            </div>

            {/* After Badge */}
            <div className="absolute bottom-8 right-8 px-5 py-2 bg-black/40 backdrop-blur-md text-white/90 text-[10px] tracking-[0.1em] uppercase font-bold z-10">
              AI Enhanced
            </div>

            {/* Slider Handle and Line */}
            <div 
              className="absolute top-0 bottom-0 w-px bg-white/70 flex items-center justify-center pointer-events-none"
              style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-12 h-12 bg-white/90 shadow-sm rounded-lg flex items-center justify-center text-gray-400">
                <ChevronsLeftRight className="w-5 h-5" />
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
