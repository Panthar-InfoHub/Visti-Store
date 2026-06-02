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
              Explore Our Bridal<br />Necklace Collection
            </h2>
            <p 
              className="text-lg mb-10 leading-relaxed font-medium"
              style={{ color: siteConfig.colors.secondary, opacity: 0.7 }}
            >
              Discover our exquisite bride collection, showcasing a wide
              range of elegant necklaces designed to add a touch of
              timeless beauty and sophistication to your special day.
              Each piece is crafted with care to perfectly complement
              your wedding ensemble and make your celebration even
              more memorable.
            </p>
            
            <Link
              href="/products"
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
