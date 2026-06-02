import type React from "react";
import { Poppins } from "next/font/google";
import { ReactLenis } from "@/components/shared/lenis";
import { Toaster } from "@/components/ui/sonner";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { siteConfig } from "@/site.config";
import "lenis/dist/lenis.css";
import "./(store)/styless.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: siteConfig.title,
    template: `%s | ${siteConfig.title}`,
  },
  description: siteConfig.description,
  keywords: [
    "Robotics",
    "IoT",
    "AI",
    "Drones",
    "STEM Education",
    "Electronics Components",
    "Arduino",
    "Raspberry Pi",
    "DIY Kits",
  ],
  authors: [{ name: "Vishti Store" }],
  creator: "Vishti Store",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={` ${poppins.className} antialiased`} suppressHydrationWarning>
      <ReactLenis root>
        <body className="min-h-screen bg-background text-foreground" style={
          {
            "--background": siteConfig.colors.bgColor,
          } as React.CSSProperties
        } suppressHydrationWarning>
          <ScrollToTop />
          {children}
          <Toaster />
        </body>
      </ReactLenis>
    </html>
  );
}
