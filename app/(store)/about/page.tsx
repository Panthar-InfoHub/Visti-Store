import Image from "next/image";
import { generatePageMetadata } from "@/lib/metadata";
import { siteConfig } from "@/site.config";

export const metadata = generatePageMetadata({
  title: "About Us",
  description:
    "A luxury jewelry destination committed to creating exquisite pieces that reflect sophistication, beauty, and enduring value.",
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
              About Vishti
            </h1>
            <p 
              className="text-base md:text-lg lg:text-xl leading-relaxed max-w-3xl mx-auto"
              style={{ color: siteConfig.colors.secondary }}
            >
              A luxury jewelry destination committed to creating exquisite pieces that reflect sophistication, beauty, and enduring value. We specialize in handcrafted gold, diamond, and gemstone jewelry, offering exclusive collections for bridal wear, special occasions, and modern lifestyles. With a focus on superior craftsmanship, innovative design, and personalized service, we transform precious metals and stones into timeless treasures.
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
                  src="/visti-image/ceo.png"
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
                  Pavaki Arora
                </p>
                <p 
                  className="mt-1 text-sm md:text-base"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  Founder
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
                  Timeless Elegance, Crafted to Perfection
                </h2>
              </div>

              <div className="space-y-4">
                <p 
                  className="leading-relaxed text-sm md:text-base"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  At Vishti, our vision is to redefine luxury jewelry by creating exquisite pieces that celebrate beauty, heritage, and individuality. We believe jewelry is more than an accessory—it is a reflection of personal stories, cherished memories, and timeless elegance.
                </p>
                <p 
                  className="leading-relaxed text-sm md:text-base"
                  style={{ color: siteConfig.colors.secondary }}
                >
                  Our mission is to craft exceptional jewelry that seamlessly blends artistry, innovation, and unmatched craftsmanship. By using the finest materials and maintaining the highest standards of quality, we are dedicated to offering creations that inspire confidence, mark life's most meaningful moments, and remain treasured for generations.
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
                To create beautiful and meaningful jewelry pieces that celebrate life's special moments with elegance and authenticity.
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
                Founded by Pavaki Arora, the brand was established with a vision to create jewelry that embodies elegance, artistry, and enduring value. Through meticulous craftsmanship, premium materials, and attention to detail, we design timeless pieces that inspire confidence, celebrate milestones, and transform precious moments into lasting memories.
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
              Timeless jewelry creations designed to celebrate life's most precious moments
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-6">
            {[
              "Fine Gold, Diamond & Gemstone Jewelry",
              "Exclusive Bridal & Wedding Collections",
              "Bespoke Jewelry Design Services",
              "Luxury Fashion & Everyday Wear Collections",
              "Jewelry Care, Repair & Restoration",
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

      {/* Why Vishti Store - Minimal Grid */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="mb-12">
            <h2 
              className="text-2xl md:text-3xl font-semibold mb-3"
              style={{ color: siteConfig.colors.secondary }}
            >
              Why Choose Vishti?
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
            {[
              "Premium Quality Craftsmanship",
              "Certified Diamonds & Authentic Jewelry",
              "Unique & Innovative Designs",
              "Personalized Customer Experience",
              "Ethical Sourcing & Sustainability",
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
            Vishti is dedicated to creating exquisite jewelry that embodies sophistication, artistry, and timeless elegance for generations to cherish.
          </p>
        </div>
      </section>
    </div>
  );
}
