import { Shield, Truck, DollarSign, Package } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Trust & Reliability",
    description: "100% Genuine Products. Pan-India Delivery",
  },
  {
    icon: Truck,
    title: "Free Shipping",
    description: "Terms and conditions applied",
  },
  {
    icon: DollarSign,
    title: "Best Price Guarantee",
    description: "Got better prices? We try to match!",
  },
  {
    icon: Package,
    title: "Easy Returns",
    description: "7 Day Easy Returns & Replacement",
  },
];

const iconColors = ["text-cyan-600", "text-emerald-600", "text-orange-600", "text-blue-600"];

export function TrustBadges() {
  return (
    <section className="py-12 md:py-16 bg-white border-y">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {features.map((feature, index) => (
            <div key={feature.title} className="flex flex-col items-center text-center group">
              <div
                className={`p-3 rounded-full ${
                  index === 0
                    ? "bg-cyan-50"
                    : index === 1
                    ? "bg-emerald-50"
                    : index === 2
                    ? "bg-orange-50"
                    : "bg-blue-50"
                } mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <feature.icon className={`h-7 w-7 ${iconColors[index]}`} strokeWidth={1.5} />
              </div>
              <h3 className="text-sm md:text-base font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
