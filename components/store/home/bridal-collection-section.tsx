import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/site.config";

export function BridalCollectionSection() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: "#FFD3D9" }}>
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
          
          {/* Left Content */}
          <div className="max-w-xl">
            <h2 
              className="text-4xl md:text-5xl lg:text-[52px] font-bold mb-6 leading-tight tracking-tight"
              style={{ color: siteConfig.colors.secondary }}
            >
              About Us
            </h2>
            <div 
              className="text-base md:text-lg mb-8 leading-relaxed font-medium space-y-4"
              style={{ color: siteConfig.colors.secondary }}
            >
              <p>
                Vishti was born from a simple belief: elegance shouldn&apos;t come with a hefty price tag. I founded Vishti as a teenager with a vision and a love for beautiful things — to make jewellery that sparks elegance and feels accessible to everyone.
              </p>
              <p>
                Every piece is thoughtfully curated to bring out the boldness in you, because true elegance isn&apos;t about how much you spend — it&apos;s about how you carry yourself.
              </p>
              <p className="font-semibold text-lg md:text-xl pt-1" style={{ color: siteConfig.colors.primary }}>
                Bright. Bold. Beautiful. That&apos;s Vishti.
              </p>
            </div>
            
            <Link
              href="/about"
              className="inline-block text-white px-8 py-3.5 text-sm uppercase font-bold transition-all duration-300 hover:opacity-90 rounded-sm shadow-sm"
              style={{ backgroundColor: siteConfig.colors.primary }}
            >
              View More
            </Link>
          </div>

          {/* Right Image Content */}
          <div className="flex justify-center lg:justify-end">
            <div 
              className="relative w-full max-w-md aspect-[4/5] overflow-hidden shadow-2xl"
              style={{ borderRadius: "50% 50% 0 0" }}
            >
              <Image
                src="/image/bridal-portrait.png"
                alt="Bridal Necklace Collection"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
