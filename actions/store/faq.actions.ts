"use server";

import { prisma } from "@/prisma/db";

// Get published FAQs for public display
export async function getPublishedFAQsForStore() {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: {
        isPublished: true,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        question: true,
        answer: true,
        order: true,
      },
    });

    // Add 1 to order to make it user-friendly (1-indexed instead of 0-indexed)
    const faqsWithAdjustedOrder = faqs.map((faq) => ({
      ...faq,
      order: faq.order + 1,
    }));

    return { success: true, data: faqsWithAdjustedOrder };
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return { success: false, error: "Failed to fetch FAQs" };
  }
}
