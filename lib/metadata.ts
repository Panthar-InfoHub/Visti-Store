import { siteConfig } from "@/site.config";
import { Metadata } from "next";

/**
 * Generate metadata for pages using siteConfig
 * This makes the app reusable across different websites
 */
export function generatePageMetadata({
  title,
  description,
  path = "/",
  image,
  keywords,
}: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const pageTitle = title ? `${title} - ${siteConfig.name}` : siteConfig.title;
  const pageDescription = description || siteConfig.description;
  const url = `${siteConfig.domain}${path}`;
  const ogImage = image || `${siteConfig.domain}/opengraph-image.jpeg`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: keywords,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      type: "website",
      locale: "en_IN",
      url: url,
      siteName: siteConfig.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: pageTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [ogImage],
    },
    alternates: {
      canonical: url,
    },
  };
}
