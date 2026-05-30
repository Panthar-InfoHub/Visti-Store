import Image from "next/image";

const labSetups = [
  {
    id: 1,
    title: "Drone Lab Setup",
    image: "/images/drone-lab.jpeg",
    alt: "Professional Drone Lab Setup - Complete with equipment and training materials",
  },
  {
    id: 2,
    title: "Robotics Lab Setup",
    image: "/images/robotics-lab.jpg",
    alt: "Advanced Robotics Lab Setup - Equipped with latest technology",
  },
];

export function LabSetup() {
  return (
    <section className="py-12 md:py-16 bg-gray-50">
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wider mb-3">
            Lab Solutions
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Complete Lab Infrastructure
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Industry-standard lab setups designed to provide comprehensive hands-on learning
            experience
          </p>
        </div>

        {/* Lab Setup Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          {labSetups.map((lab, index) => (
            <div
              key={lab.id}
              className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-cyan-400"
            >
              {/* Image Container */}
              <div className="relative aspect-16/10 overflow-hidden">
                <Image
                  src={lab.image}
                  alt={lab.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-gray-900/70 via-gray-900/20 to-transparent" />

                {/* Title Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{lab.title}</h3>
                  <div className="w-16 h-1 bg-cyan-400 rounded-full shadow-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4 font-medium">
            Interested in setting up a lab at your institution?
          </p>
          <a
            href="/bulk-order"
            className="inline-flex items-center justify-center px-8 py-3 text-base font-semibold text-white bg-cyan-600 hover:bg-cyan-700 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </section>
  );
}
