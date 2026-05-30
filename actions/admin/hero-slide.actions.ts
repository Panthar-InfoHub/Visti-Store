"use server";

import { prisma } from "@/prisma/db";
import { SlideType } from "@/prisma/generated/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const heroSlideSchema = z
  .object({
    slideType: z.enum(["IMAGE_ONLY", "IMAGE_WITH_CONTENT"]),
    order: z.number().int().min(0),
    isActive: z.boolean(),
    image: z.string().min(1, "Image is required"),
    mobileImage: z.string().optional(),
    imageAlt: z.string().optional(),
    title: z.string().optional(),
    subtitle: z.string().optional(),
    description: z.string().optional(),
    buttonText: z.string().optional(),
    buttonLink: z.string().optional(),
  })
  .refine(
    (data) => {
      // If IMAGE_WITH_CONTENT, at least title should be provided
      if (data.slideType === "IMAGE_WITH_CONTENT" && !data.title) {
        return false;
      }
      return true;
    },
    {
      message: "Title is required for slides with content",
      path: ["title"],
    }
  );

// Get all hero slides
export async function getHeroSlides() {
  try {
    const slides = await prisma.heroSlide.findMany({
      orderBy: { order: "asc" },
    });

    return { success: true, data: slides };
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return { success: false, error: "Failed to fetch hero slides" };
  }
}

// Get active hero slides for frontend
export async function getActiveHeroSlides() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });

    return { success: true, data: slides };
  } catch (error) {
    console.error("Error fetching active hero slides:", error);
    return { success: false, error: "Failed to fetch hero slides" };
  }
}

// Get single hero slide
export async function getHeroSlide(id: string) {
  try {
    const slide = await prisma.heroSlide.findUnique({
      where: { id },
    });

    if (!slide) {
      return { success: false, error: "Hero slide not found" };
    }

    return { success: true, data: slide };
  } catch (error) {
    console.error("Error fetching hero slide:", error);
    return { success: false, error: "Failed to fetch hero slide" };
  }
}

// Create hero slide
export async function createHeroSlide(data: z.infer<typeof heroSlideSchema>) {
  try {
    const validated = heroSlideSchema.parse(data);

    const slide = await prisma.heroSlide.create({
      data: {
        slideType: validated.slideType as SlideType,
        order: validated.order,
        isActive: validated.isActive,
        image: validated.image,
        mobileImage: validated.mobileImage || null,
        imageAlt: validated.imageAlt || "",
        title: validated.title || null,
        subtitle: validated.subtitle || null,
        description: validated.description || null,
        buttonText: validated.buttonText || null,
        buttonLink: validated.buttonLink || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/hero-slides");

    return { success: true, data: slide };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error creating hero slide:", error);
    return { success: false, error: "Failed to create hero slide" };
  }
}

// Update hero slide
export async function updateHeroSlide(id: string, data: z.infer<typeof heroSlideSchema>) {
  try {
    const validated = heroSlideSchema.parse(data);

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        slideType: validated.slideType as SlideType,
        order: validated.order,
        isActive: validated.isActive,
        image: validated.image,
        mobileImage: validated.mobileImage || null,
        imageAlt: validated.imageAlt || "",
        title: validated.title || null,
        subtitle: validated.subtitle || null,
        description: validated.description || null,
        buttonText: validated.buttonText || null,
        buttonLink: validated.buttonLink || null,
      },
    });

    revalidatePath("/");
    revalidatePath("/admin/hero-slides");

    return { success: true, data: slide };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error("Error updating hero slide:", error);
    return { success: false, error: "Failed to update hero slide" };
  }
}

// Delete hero slide
export async function deleteHeroSlide(id: string) {
  try {
    await prisma.heroSlide.delete({
      where: { id },
    });

    revalidatePath("/");
    revalidatePath("/admin/hero-slides");

    return { success: true };
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return { success: false, error: "Failed to delete hero slide" };
  }
}

// Bulk update order
export async function updateHeroSlidesOrder(slides: { id: string; order: number }[]) {
  try {
    await prisma.$transaction(
      slides.map((slide) =>
        prisma.heroSlide.update({
          where: { id: slide.id },
          data: { order: slide.order },
        })
      )
    );

    revalidatePath("/");
    revalidatePath("/admin/hero-slides");

    return { success: true };
  } catch (error) {
    console.error("Error updating hero slides order:", error);
    return { success: false, error: "Failed to update slides order" };
  }
}
