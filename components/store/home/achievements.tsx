import Image from "next/image";

const achievements = [
  {
    id: 1,
    image: "/images/achievement-1.jpeg",
    alt: "Students learning robotics at Vyomtics workshop",
  },
  {
    id: 2,
    image: "/images/achievement-3.jpeg",
    alt: "Robotics training session in progress",
  },
  {
    id: 3,
    image: "/images/achievement-2.jpeg",
    alt: "Students engaged in hands-on robotics learning",
  },
];

export function Achievements() {
  return (
    <section className="py-12 md:py-16 bg-white relative overflow-hidden">
      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <p className="text-sm font-semibold text-cyan-600 uppercase tracking-wider mb-3">
            Our Impact
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Empowering the Next Generation
          </h2>
          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            Transforming education through hands-on robotics and drone technology training
          </p>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-200 hover:border-cyan-400"
            >
              <div className="relative aspect-4/3 overflow-hidden">
                <Image
                  src={achievement.image}
                  alt={achievement.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
