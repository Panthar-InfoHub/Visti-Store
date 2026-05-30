import Image from "next/image";
import { generatePageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/site.config";

export const metadata = generatePageMetadata({
  title: "About Us",
  description:
    "JP Interio is a technology-driven organization dedicated to advancing interior design and furniture solutions across India.",
});

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero Section - Clean and Minimal */}
      <section className="border-b">
        <div className="container mx-auto px-6 py-16 md:py-24 max-w-5xl">
          <div className="text-center space-y-5">
            <h1 
              className="text-3xl md:text-5xl lg:text-6xl font-semibold tracking-tight"
              style={{ color: siteConfig.colors.secondary }}
            >
              About JP Interio
            </h1>
            <p 
              className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto"
              style={{ color: siteConfig.colors.secondary }}
            >
              A design-driven interior solutions company dedicated to creating modern, functional, and aesthetically refined spaces. We specialize in residential, commercial, and luxury interior design services, offering innovative concepts, customized solutions, and complete turnkey execution for homes, offices, retail spaces, hotels, and businesses.
            </p>
          </div>
        </div>
      </section>

      {/* Founder Section - Elegant Layout */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            {/* Image */}
            <div className="lg:col-span-2">
              <div className="relative aspect-square max-w-[280px] md:max-w-[280px] mx-auto w-full rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="/image/ceo.png"
                  alt="Nishant Kishor Sharma - Founder & CEO"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-5 text-center">
                <p 
                  className="font-semibold text-lg md:text-xl"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  Pavneet Singh
                </p>
                <p 
                  className="mt-1 text-sm md:text-base"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  Founder & CEO
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="lg:col-span-3 space-y-6">
              <div>
                <p 
                  className="text-xs md:text-sm font-semibold uppercase tracking-wider mb-3"
                  style={{ color: siteConfig.colors.primary }}
                >
                  Founder's Vision
                </p>
                <h2 
                  className="text-xl md:text-2xl lg:text-3xl font-semibold leading-tight mb-6"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  Designing Timeless Spaces for Modern Living
                </h2>
              </div>

              <div className="space-y-4">
                <p 
                  className="leading-relaxed text-sm md:text-base"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  "At JP INTERIO, our vision is to transform spaces into experiences that inspire comfort, functionality, and elegance. We don’t just create interiors and furniture — we craft environments that reflect personality, lifestyle, and modern living with creativity and precision."
                </p>
                <p 
                  className="leading-relaxed text-sm md:text-base"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  "Our mission is to deliver innovative interior design solutions and premium furniture that combine aesthetics with practicality. Through thoughtful design, quality craftsmanship, and attention to detail, we are committed to creating spaces where ideas come to life and every corner tells a story."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision - Side by Side */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            <div>
              <h3 
                className="text-xs md:text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: siteConfig.colors.primary }}
              >
                Our Mission
              </h3>
              <p 
                className="text-lg md:text-xl lg:text-2xl font-medium leading-relaxed"
                style={{ color: siteConfig.colors.secondary }}
              >
                To create elegant, functional, and personalized interiors with premium furniture and timeless design solutions.
              </p>
            </div>
            <div>
              <h3 
                className="text-xs md:text-sm font-semibold uppercase tracking-wider mb-3"
                style={{ color: siteConfig.colors.primary }}
              >
                Founded By
              </h3>
              <p 
                className="text-sm md:text-base leading-relaxed"
                style={{ color: siteConfig.colors.secondary }}
              >
                Founded by Pavneet Singh, the company aims to redefine modern interiors through creativity, functionality, and timeless design. With a strong focus on quality craftsmanship and personalized solutions, we create elegant spaces and furniture that enhance everyday living while reflecting style, comfort, and sophistication.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Do - Clean List */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-12">
            <h2 
              className="text-2xl md:text-3xl font-semibold mb-3"
              style={{ color: siteConfig.colors.secondary }}
            >
              What We Do
            </h2>
            <p 
              className="text-base md:text-lg"
              style={{ color: siteConfig.colors.secondary }}
            >
              Comprehensive interior and furniture solutions for modern living spaces
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            {[
              "Residential & Commercial Interior Design",
              "Customized Furniture Solutions",
              "Turnkey Project Execution",
              "3D Visualization & Walkthroughs",
              "Material Selection & Procurement",
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3 group">
                <div 
                  className="shrink-0 w-1.5 h-1.5 rounded-full mt-2.5"
                  style={{ backgroundColor: siteConfig.colors.primary }}
                />
                <p 
                  className="text-base md:text-lg leading-relaxed transition-colors"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why JP Interio - Minimal Grid */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-12">
            <h2 
              className="text-2xl md:text-3xl font-semibold mb-3"
              style={{ color: siteConfig.colors.secondary }}
            >
              Why Choose JP Interio?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {[
              "High-quality and trusted materials",
              "Wide range of materials and finishes",
              "Professional project management",
              "On-time delivery and installation",
              "Post-project support and maintenance",
            ].map((item, index) => (
              <div key={index} className="group">
                <div 
                  className="w-9 h-9 rounded-full text-white flex items-center justify-center mb-3 text-sm font-medium transition-colors"
                  style={{ backgroundColor: siteConfig.colors.primary }}
                >
                  {index + 1}
                </div>
                <p 
                  className="text-base md:text-lg leading-relaxed"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Closing Statement */}
      <section className="py-16 md:py-24 border-t">
        <div className="container mx-auto px-6 max-w-4xl text-center">
          <p 
            className="text-xl md:text-2xl font-medium leading-relaxed"
            style={{ color: siteConfig.colors.secondary }}
          >
            JP Interio is committed to shaping the next generation of living spaces through creativity,
            functionality, and timeless design.
          </p>
        </div>
      </section>
    </div>
  );
}
