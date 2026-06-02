import { siteConfig } from "@/site.config";

const testimonials = [
  {
    quote:
      "Celestia's luxe jewels don't just make you look good—they boost your whole vibe. Every gem's fine craftsmanship adds a cool, classy touch to any event.",
    author: "Priya S.",
  },
  {
    quote:
      "Celestia's luxe jewels don't just make you look good—they boost your whole vibe. Every gem's fine craftsmanship adds a cool, classy touch to any event.",
    author: "Rohan M.",
  },
];

export function JewelleryTestimonialsSection() {
  return (
    <section className="py-16 md:py-24" style={{ backgroundColor: "#fff0f8" }}>
      <div className="container mx-auto px-6 max-w-7xl">
        {/* Heading */}
        <h2
          className="text-3xl md:text-4xl lg:text-[42px] font-bold text-center mb-12 md:mb-16 leading-tight"
          style={{ color: "#1a1a1a" }}
        >
          A Favourite Among Jewellery
          <br />
          Enthusiasts!
        </h2>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="rounded-2xl px-8 py-10 md:px-10 md:py-12 flex flex-col items-center text-center"
              style={{ backgroundColor: "#f5d8f0" }}
            >
              {/* Quotation Mark */}
              <span
                className="text-7xl md:text-8xl font-bold leading-none mb-4 block"
                style={{ color: "#FF69B4" }}
              >
                &ldquo;
              </span>

              {/* Quote Text */}
              <p
                className="text-base md:text-lg leading-relaxed mb-8 max-w-md"
                style={{ color: "#2a2a2a" }}
              >
                {testimonial.quote}
              </p>

              {/* Author */}
              <p className="font-bold text-base" style={{ color: "#1a1a1a" }}>
                {testimonial.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
