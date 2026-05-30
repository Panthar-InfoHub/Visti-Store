import Image from "next/image";

export function NewsSection() {
  return (
    <section className="py-8 md:py-16 ">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 mb-4">
            Vyomtics in News
          </h2>
          <p className="text-lg text-gray-600">Featured in leading publications</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-200">
            <div className="relative w-full h-[250px] sm:h-[350px] md:h-[400px] lg:h-[450px]">
              <Image
                src="/images/news-clipping.jpeg"
                alt="Vyomtics News Coverage"
                fill
                className="object-contain"
                priority
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 90vw, 1200px"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
