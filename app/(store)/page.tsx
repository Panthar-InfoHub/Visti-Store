import { generatePageMetadata } from "@/lib/metadata";
import { HeroCarousel } from "@/components/store/home/hero-carousel";
import { FeaturedCategoriesNav } from "@/components/store/home/featured-categories-nav";
import { ShopCategoryCards } from "@/components/store/home/shop-category-cards";
import { FeaturedProducts } from "@/components/store/home/featured-products";
import { TrustBadges } from "@/components/store/home/trust-badges";
import { Testimonials } from "@/components/store/home/testimonials";
import { FAQSection } from "@/components/store/home/faq-section";
import { Achievements } from "@/components/store/home/achievements";
import { LabSetup } from "@/components/store/home/lab-setup";
import { NewsSection } from "@/components/store/home/news-section";
import { prisma } from "@/prisma/db";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { siteConfig } from "@/site.config";
import Image from "next/image";
import { VisualizeSection } from "@/components/store/home/visualize-section";
import { InteriorExperienceSection } from "@/components/store/home/interior-experience-section";

export const metadata = generatePageMetadata({
  path: "/",
});

// Separate component for hero slides
async function HeroSection() {
  const heroSlides = await prisma.heroSlide.findMany({
    where: { isActive: true },
    orderBy: { order: "asc" },
  });

  return <HeroCarousel slides={heroSlides} />;
}

export default async function HomePage() {
  return (
    <>
      <Suspense
        fallback={
          <div className="w-full bg-white">
            <div className="container mx-auto px-4 py-3 md:py-4 flex justify-center gap-6 md:gap-12">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-5 w-24 hidden sm:block" />
              <Skeleton className="h-5 w-20 hidden md:block" />
              <Skeleton className="h-5 w-24 hidden lg:block" />
              <Skeleton className="h-5 w-28 hidden lg:block" />
            </div>
          </div>
        }
      >
        <FeaturedCategoriesNav />
      </Suspense>
      <Suspense
        fallback={
          <div className="relative w-full overflow-hidden bg-linear-to-b from-blue-50 via-white to-gray-50 border-b border-blue-100">
            <div className="relative h-[450px] md:h-[550px] lg:h-[650px] flex items-center justify-center">
              <Skeleton className="h-full w-full" />
            </div>
          </div>
        }
      >
        <HeroSection />
      </Suspense>

      <Suspense fallback={<CategorySkeleton />}>
        <ShopCategoryCards />
      </Suspense>

      <Suspense fallback={<ProductSectionSkeleton title="SHOP OUR BESTSELLERS" />}>
        <FeaturedProducts title="SHOP OUR BESTSELLERS" filter="bestseller" />
      </Suspense>

      <VisualizeSection />

      

      {/* <Testimonials /> */}

      <Suspense fallback={<ProductSectionSkeleton title="NEW LAUNCH" />}>
        <FeaturedProducts title="NEW LAUNCH" filter="new" />
      </Suspense>
      
      <InteriorExperienceSection />
      {/* <Achievements />
      <LabSetup />
      <NewsSection />
      <TrustBadges /> */}

      <Suspense fallback={<FAQSectionSkeleton />}>
        <FAQWrapper />
      </Suspense>

      {/* fixed bottom floating whatsapp button */}
      <Link
        href={`https://wa.me/${siteConfig.contact.whatsapp}`}
        className="bg-green-500 hover:bg-green-600 transition-colors fixed bottom-6 right-6 z-50 rounded-lg w-24  flex justify-center items-center p-2 shadow-lg gap-1"
        target="_blank"
        rel="noopener noreferrer"
      >
        <Image src="/whatsapp.svg" alt="WhatsApp" width={24} height={24} className=" " />
        <span className="text-white font-medium text-sm">Chat</span>
      </Link>
    </>
  );
}

// Optimized Wrappers and Skeletons
async function FAQWrapper() {
  const faqs = await prisma.fAQ.findMany({
    where: { isPublished: true },
    orderBy: { order: "asc" },
    select: { id: true, question: true, answer: true },
  });
  return <FAQSection faqs={faqs} />;
}

function CategorySkeleton() {
  return (
    <section className="py-12 md:py-16 bg-white">
      <div className="container mx-auto px-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <Skeleton className="h-10 w-64 mb-12" />
        <div className="grid grid-cols-2 md:grid-cols-6 lg:grid-cols-4 gap-4 md:gap-6">
          <Skeleton className="col-span-2 md:col-span-3 lg:col-span-2 lg:row-span-2 aspect-square rounded-2xl" />
          <Skeleton className="col-span-1 md:col-span-3 lg:col-span-1 lg:row-span-1 aspect-square rounded-2xl" />
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="col-span-1 md:col-span-2 lg:col-span-1 lg:row-span-1 aspect-square rounded-2xl" />
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSectionSkeleton({ title }: { title: string }) {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <Skeleton className="h-4 w-24 mb-3" />
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="aspect-square w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSectionSkeleton() {
  return (
    <section className="py-12 md:py-16">
      <div className="container mx-auto px-6">
        <Skeleton className="h-10 w-48 mb-8 mx-auto" />
        <div className="max-w-3xl mx-auto space-y-4">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </section>
  );
}
