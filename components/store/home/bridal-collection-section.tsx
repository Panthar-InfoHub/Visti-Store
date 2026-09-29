import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/site.config";
import { Sparkles, Gem, Award, CheckCircle2, ArrowRight, Quote } from "lucide-react";

export function BridalCollectionSection() {
  const whatWeDoItems = [
    "Fine Gold, Diamond & Gemstone Jewelry",
    "Exclusive Bridal & Wedding Collections",
    "Bespoke Custom Jewelry Design Services",
    "Luxury Fashion & Everyday Wear Collections",
    "Jewelry Care, Repair & Restoration",
  ];

  const whyChooseUsItems = [
    "Premium Quality Craftsmanship",
    "Certified Diamonds & Authentic Jewelry",
    "Unique & Innovative Contemporary Designs",
    "Personalized & Dedicated Customer Experience",
    "Ethical Sourcing & Sustainable Practices",
  ];

  return (
    <section className="py-16 md:py-24 bg-[#FFD3D9] text-[#5A2D00]">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl space-y-16">
        
        {/* Top Hero Row: Main Brand Story + Arched Image */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/60 backdrop-blur-xs text-xs font-bold uppercase tracking-wider shadow-xs" style={{ color: siteConfig.colors.primary }}>
              <Sparkles className="w-3.5 h-3.5" />
              <span>Our Story & Heritage</span>
            </div>

            <h2 
              className="text-4xl md:text-5xl lg:text-[54px] font-bold leading-tight tracking-tight"
              style={{ color: siteConfig.colors.secondary }}
            >
              About Vishti
            </h2>

            <div className="space-y-4 text-base md:text-lg leading-relaxed font-normal">
              <p>
                Vishti was born from a simple belief: elegance shouldn&apos;t come with a hefty price tag. Founded with a vision and a passion for beautiful things, we make jewellery that sparks boldness, confidence, and accessible luxury for every special moment.
              </p>
              <p>
                Every piece is thoughtfully curated to bring out the boldness in you, because true elegance isn&apos;t about how much you spend — it&apos;s about how you carry yourself.
              </p>
            </div>

            <div className="pt-2">
              <p className="font-bold text-xl md:text-2xl tracking-wide" style={{ color: siteConfig.colors.tertiary }}>
                Bright. Bold. Beautiful. That&apos;s Vishti.
              </p>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-4">
              {/* <Link
                href="/about"
                className="inline-flex items-center gap-2 text-white px-8 py-3.5 text-sm uppercase font-bold transition-all duration-300 hover:opacity-90 rounded-md shadow-md"
                style={{ backgroundColor: siteConfig.colors.primary }}
              >
                <span>View Full Story</span>
                <ArrowRight className="w-4 h-4" />
              </Link> */}
            </div>
          </div>

          {/* Right Image Feature */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Square Image Container */}
              <div className="relative aspect-square w-full overflow-hidden rounded-2xl shadow-xl border-4 border-white/90">
                <Image
                  src="/visti-image/ceo.png"
                  alt="Pavaki Arora - Founder"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover object-top"
                  priority
                />
              </div>

              {/* Floating Founder Tag Badge */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-white/95 backdrop-blur-md px-6 py-2.5 rounded-full shadow-lg border border-white/60 text-center shrink-0 whitespace-nowrap">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: siteConfig.colors.primary }}>
                  Pavaki Arora
                </p>
                <p className="text-[11px] text-gray-700 font-bold uppercase tracking-wider mt-0.5">
                  Founder
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Middle Row: Founder's Vision & Our Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
          
          {/* Founder Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-white/60 flex flex-col justify-center space-y-3">
            <div className="flex items-center gap-2">
              <Quote className="w-4 h-4 text-[#ED0D0C]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#ED0D0C]">Founder&apos;s Vision</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#5A2D00]">Pavaki Arora</h3>
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Founder & Creative Lead</p>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-gray-800 font-medium italic pt-1">
              &quot;Redefining luxury jewelry by creating exquisite pieces that celebrate beauty, heritage, and individuality—blending artistry with unmatched craftsmanship.&quot;
            </p>
          </div>

          {/* Mission Card */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-all border border-white/60 flex flex-col justify-center space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#ED0D0C]/10 flex items-center justify-center text-[#ED0D0C]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[#ED0D0C]">Our Core Purpose</span>
                <h3 className="text-xl font-bold text-[#5A2D00]">Our Mission</h3>
              </div>
            </div>
            <p className="text-sm md:text-base leading-relaxed text-gray-800 font-medium italic">
              &quot;To create beautiful and meaningful jewelry pieces that celebrate life&apos;s special moments with elegance, authenticity, and enduring value.&quot;
            </p>
          </div>

        </div>

        {/* Bottom Row: What We Do & Why Choose Vishti */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
          
          {/* What We Do */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm border border-white/60 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200/80 pb-4">
              <div className="w-10 h-10 rounded-full bg-[#ED0D0C] text-white flex items-center justify-center shadow-xs">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#5A2D00]">What We Do</h3>
                <p className="text-xs text-gray-600">Creations designed to celebrate life&apos;s moments</p>
              </div>
            </div>

            <ul className="space-y-3.5">
              {whatWeDoItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm md:text-base font-medium text-gray-800">
                  <CheckCircle2 className="w-5 h-5 text-[#ED0D0C] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Why Choose Vishti */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 shadow-sm border border-white/60 space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-200/80 pb-4">
              <div className="w-10 h-10 rounded-full bg-[#ED0D0C] text-white flex items-center justify-center shadow-xs">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#5A2D00]">Why Choose Vishti?</h3>
                <p className="text-xs text-gray-600">Uncompromising quality & commitment</p>
              </div>
            </div>

            <ul className="space-y-3.5">
              {whyChooseUsItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm md:text-base font-medium text-gray-800">
                  <span className="w-5 h-5 rounded-full bg-[#ED0D0C] text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

        {/* Footer Statement */}
        <div className="text-center max-w-3xl mx-auto pt-4 border-t border-[#5A2D00]/10">
          <p className="text-base md:text-lg font-medium text-[#5A2D00]/90 italic">
            &quot;Vishti is dedicated to creating exquisite jewelry that embodies sophistication, artistry, and timeless elegance for generations to cherish.&quot;
          </p>
        </div>

      </div>
    </section>
  );
}

