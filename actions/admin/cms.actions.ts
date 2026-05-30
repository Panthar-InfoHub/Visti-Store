"use server";

import { prisma } from "@/prisma/db";
import { getAdminSession } from "@/lib/admin-auth";
import { revalidatePath } from "next/cache";

// Fixed pages that should exist in the system
const FIXED_PAGES = [
  { slug: "terms-and-conditions", title: "Terms and Conditions" },
  { slug: "shipping-policy", title: "Shipping Policy" },
  { slug: "privacy-policy", title: "Privacy Policy" },
  { slug: "return-policy", title: "Return Policy" },
];

// Initialize fixed pages if they don't exist
export async function initializeFixedPages() {
  try {
    for (const page of FIXED_PAGES) {
      const existing = await prisma.cMSPage.findUnique({
        where: { slug: page.slug },
      });

      if (!existing) {
        await prisma.cMSPage.create({
          data: {
            slug: page.slug,
            title: page.title,
            content: `<p>Content for ${page.title} goes here. Edit this page to add your content.</p>`,
            isPublished: false,
          },
        });
      }
    }
    return { success: true };
  } catch (error) {
    console.error("Error initializing fixed pages:", error);
    return { success: false, error: "Failed to initialize pages" };
  }
}

// Get all CMS pages (only the 5 fixed pages)
export async function getAllCMSPages() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    // Ensure all fixed pages exist
    await initializeFixedPages();

    const pages = await prisma.cMSPage.findMany({
      orderBy: {
        slug: "asc",
      },
    });

    return { success: true, data: pages };
  } catch (error) {
    console.error("Error fetching CMS pages:", error);
    return { success: false, error: "Failed to fetch pages" };
  }
}

// Get single CMS page by ID
export async function getCMSPageById(id: string) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const page = await prisma.cMSPage.findUnique({
      where: { id },
    });

    if (!page) {
      return { success: false, error: "Page not found" };
    }

    return { success: true, data: page };
  } catch (error) {
    console.error("Error fetching CMS page:", error);
    return { success: false, error: "Failed to fetch page" };
  }
}

// Get CMS page by slug (public)
export async function getCMSPageBySlug(slug: string) {
  try {
    const page = await prisma.cMSPage.findUnique({
      where: {
        slug,
      },
    });

    if (!page) {
      return { success: false, error: "Page not found" };
    }

    // Return unpublished status if not published
    if (!page.isPublished) {
      return { success: false, error: "Page not published" };
    }

    return { success: true, data: page };
  } catch (error) {
    console.error("Error fetching CMS page:", error);
    return { success: false, error: "Failed to fetch page" };
  }
}

// Update CMS page (can only update content, meta, and publish status - NOT slug or title)
export async function updateCMSPage(
  id: string,
  data: {
    content?: string;
    metaTitle?: string;
    metaDescription?: string;
    isPublished?: boolean;
  }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const page = await prisma.cMSPage.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/pages");
    revalidatePath(`/${page.slug}`);

    return { success: true, data: page };
  } catch (error) {
    console.error("Error updating CMS page:", error);
    return { success: false, error: "Failed to update page" };
  }
}

// FAQ Management

// Get all FAQs
export async function getAllFAQs() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const faqs = await prisma.fAQ.findMany({
      orderBy: {
        order: "asc",
      },
    });

    return { success: true, data: faqs };
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return { success: false, error: "Failed to fetch FAQs" };
  }
}

// Get published FAQs (public)
export async function getPublishedFAQs() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return { success: true, data: faqs };
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return { success: false, error: "Failed to fetch FAQs" };
  }
}

// Add FAQ
export async function addFAQ(data: {
  question: string;
  answer: string;
  order?: number;
  isPublished?: boolean;
}) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    // If order not provided, get the last order number
    let order = data.order;
    if (order === undefined) {
      const lastFAQ = await prisma.fAQ.findFirst({
        orderBy: { order: "desc" },
      });
      order = (lastFAQ?.order ?? -1) + 1;
    }

    const faq = await prisma.fAQ.create({
      data: {
        question: data.question,
        answer: data.answer,
        order,
        isPublished: data.isPublished ?? false,
      },
    });

    revalidatePath("/admin/faq");
    revalidatePath("/"); // Revalidate homepage

    return { success: true, data: faq };
  } catch (error) {
    console.error("Error adding FAQ:", error);
    return { success: false, error: "Failed to add FAQ" };
  }
}

// Update FAQ
export async function updateFAQ(
  id: string,
  data: {
    question?: string;
    answer?: string;
    order?: number;
    isPublished?: boolean;
  }
) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    const faq = await prisma.fAQ.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/faq");
    revalidatePath("/"); // Revalidate homepage

    return { success: true, data: faq };
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return { success: false, error: "Failed to update FAQ" };
  }
}

// Delete FAQ
export async function deleteFAQ(id: string) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.fAQ.delete({
      where: { id },
    });

    revalidatePath("/admin/faq");
    revalidatePath("/"); // Revalidate homepage

    return { success: true };
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return { success: false, error: "Failed to delete FAQ" };
  }
}

// Reorder FAQs
export async function reorderFAQs(updates: { id: string; order: number }[]) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.$transaction(
      updates.map((update) =>
        prisma.fAQ.update({
          where: { id: update.id },
          data: { order: update.order },
        })
      )
    );

    revalidatePath("/admin/faq");
    revalidatePath("/"); // Revalidate homepage

    return { success: true };
  } catch (error) {
    console.error("Error reordering FAQs:", error);
    return { success: false, error: "Failed to reorder FAQs" };
  }
}
