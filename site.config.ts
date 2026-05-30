export const siteConfig = {
  // Basic Site Information
  title: "Visti",
  name: "Visti",
  description:
    "Discover Visti, Best Online Store for jwellery and Fashion.",
  domain: "https://vististore.com",
  // Logo
  logo: {
    path: "/image/visti-logo.png",
    alt: "Visti Store Logo",
  },

  // Contact Information
  contact: {
    email: "[EMAIL_ADDRESS]",
    phone: "+91 7068999458",
    alternatePhone: "+91 7068999458",
    whatsapp: "917068999458", // Format: country code + number (no spaces or special characters)
    address: "Near JMK Showroom, Avas Vikas Phase 2, Jhansi, Uttar Pradesh 284003",
    secondAddress: "Near Hanuman Mandir, Avas Vikas Phase 2, Jhansi, Uttar Pradesh 284003",
  },

  // Social Media Links
  social: {
    facebook: "",
    instagram: "#",
    twitter: "",
    youtube: "#",
    linkedin: "",
  },

  // Admin Panel
  admin: {
    title: "JP Interio",
    subtitle: "Admin Panel",
  },

  colors: {
    primary: "#ED0D0C",
    secondary: "#5A2D00",
    tertiary: "#0DBB66",
    quaternary: "#FFBDC7",
    bgColor: "#FFF6FC"
  }
} as const;

export type SiteConfig = typeof siteConfig;
