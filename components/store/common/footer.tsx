import Link from "next/link";
import { Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { siteConfig } from "@/site.config";
import { prisma } from "@/prisma/db";

export async function Footer() {
  const topCategories = await prisma.category.findMany({
    where: { isActive: true },
    select: { name: true, slug: true },
    orderBy: { products: { _count: "desc" } },
    take: 5,
  });

  return (
    <footer
      className="relative text-[#2d2d2d] border-t border-gray-200"
      style={{
        backgroundImage: "url('/image/footer-bg.png')",
        backgroundSize: "cover",
        backgroundPosition: "right bottom",
      }}
    >
      {/* Overlay to ensure text readability if needed, or just let the natural background show */}
      <div className="absolute inset-0 bg-white/20 pointer-events-none"></div>

      <div className="w-full py-16 px-6 md:px-12 lg:px-20 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-12">
          {/* Brand Column (Left) */}
          <div className="lg:col-span-3">
            <h2 className="text-xl md:text-2xl font-bold italic text-[#1b2b22] mb-4">
              {siteConfig.name}
            </h2>
            <p className="text-[#3b4c40] text-sm leading-relaxed max-w-[260px] mb-6">
              {siteConfig.description}
            </p>
            <div className="flex gap-4">
              {siteConfig.social.facebook !== undefined && (
                <Link
                  href={siteConfig.social.facebook || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <Facebook className="h-5 w-5" />
                </Link>
              )}
              {siteConfig.social.instagram && (
                <Link
                  href={siteConfig.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <Instagram className="h-5 w-5" />
                </Link>
              )}
              {siteConfig.social.twitter !== undefined && (
                <Link
                  href={siteConfig.social.twitter || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <Twitter className="h-5 w-5" />
                </Link>
              )}
              {siteConfig.social.youtube && (
                <Link
                  href={siteConfig.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <Youtube className="h-5 w-5" />
                </Link>
              )}
            </div>
          </div>

          {/* Shop Column (Middle) */}
          <div className="lg:col-span-2">
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#1b2b22] mb-6">
              SHOP
            </h3>
            <ul className="space-y-3">
              {topCategories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-[#3b4c40] text-sm hover:text-[#1b2b22] transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service Column (Middle-Right) */}
          <div className="lg:col-span-3">
            <h3 className="text-xs font-bold tracking-[0.15em] uppercase text-[#1b2b22] mb-6">
              CUSTOMER SERVICE
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/shipping"
                  className="text-[#3b4c40] text-sm hover:text-[#1b2b22] transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-[#3b4c40] text-sm hover:text-[#1b2b22] transition-colors"
                >
                  Return and Refund Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms-and-conditions"
                  className="text-[#3b4c40] text-sm hover:text-[#1b2b22] transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-[#3b4c40] text-sm hover:text-[#1b2b22] transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Empty Space for the Vases (Far Right) */}
          <div className="hidden lg:block lg:col-span-4 pointer-events-none"></div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-[#d4cfc5]/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#3b4c40]">
          <p>Sustainably Sourced &copy; {siteConfig.name}</p>
          <p>Design & Developed by PantharInfohub</p>
        </div>
      </div>
    </footer>
  );
}
