import { z } from "zod";

// Product Section Schemas
export const textBlockSchema = z.object({
  type: z.literal("text"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const bulletListSchema = z.object({
  type: z.literal("bullets"),
  title: z.string().min(1, "Title is required"),
  items: z
    .array(z.string().min(1, "Item cannot be empty"))
    .min(1, "At least one bullet point is required"),
});

export const keyValueSchema = z.object({
  type: z.literal("specs"),
  title: z.string().min(1, "Title is required"),
  items: z
    .array(
      z.object({
        key: z.string().min(1, "Key is required"),
        value: z.string().min(1, "Value is required"),
      })
    )
    .min(1, "At least one specification is required"),
});

export const productSectionSchema = z.discriminatedUnion("type", [
  textBlockSchema,
  bulletListSchema,
  keyValueSchema,
]);

export const productFaqSchema = z.object({
  question: z.string().min(1, "Question is required"),
  answer: z.string().min(1, "Answer is required"),
});

export type ProductSection = z.infer<typeof productSectionSchema>;
export type ProductFaq = z.infer<typeof productFaqSchema>;

export const productVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().optional().nullable(),
  images: z.array(z.string()).default([]),
  mrp: z.number().positive("MRP must be positive"),
  sellingPrice: z.number().positive("Selling price must be positive"),
  stock: z.number().int().min(0, "Stock cannot be negative"),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
}).refine((data) => data.sellingPrice <= data.mrp, {
  message: "Selling price cannot be greater than MRP",
  path: ["sellingPrice"],
});

export type ProductVariantFormData = z.infer<typeof productVariantSchema>;

export type ProductFormData = z.infer<typeof productSchema>;

export const productSchema = z
  .object({
    title: z.string().min(1, "Title is required"),
    slug: z.string().min(1, "Slug is required"),
    shortDescription: z.string().optional(),
    hsnCode: z.string().optional().nullable(),
    description: z.string().min(1, "Description is required"),
    video: z.string().optional(),
    categoryId: z.string().optional().nullable(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    isBestSeller: z.boolean().default(false),
    isOnSale: z.boolean().default(false),
    isNewArrival: z.boolean().default(false),
    sections: z.array(productSectionSchema).default([]),
    faqs: z.array(productFaqSchema).default([]),
    tags: z.array(z.string()).default([]),
    variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
  });

export type CategoryFormData = z.infer<typeof categorySchema>;

export const categorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  image: z.string().optional(),
  order: z.number().int().default(0),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  parentId: z.string().optional().nullable(),
});

export type CMSPageFormData = z.infer<typeof cmsPageSchema>;
export const cmsPageSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  isPublished: z.boolean().default(false),
});

export const addressSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional(),
  address: z.string().min(5, "Address is required"),
  apartment: z.string().optional(),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
  pinCode: z.string().min(5, "Valid PIN code is required"),
  country: z.string().default("India"),
  gstNumber: z.string().optional(),
});

export const orderItemSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  variantId: z.string().min(1, "Variant ID is required"),
  name: z.string().min(1, "Product name is required"),
  image: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  quantity: z.number().int().positive("Quantity must be positive"),
});

export const orderDetailsSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  couponCode: z.string().optional(),
});

export type OrderDetails = z.infer<typeof orderDetailsSchema>;

// Checkout form schema (client-side)
export const checkoutFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  address: z.string().min(5, "Address must be at least 5 characters").max(200),
  apartment: z.string().max(100).optional(),
  country: z.string().min(2, "Country is required"),
  state: z.string().min(2, "State is required").max(50),
  city: z.string().min(2, "City is required").max(50),
  pinCode: z.string().regex(/^\d{5,6}$/, "PIN code must be 5-6 digits"),
  coupon: z.string().optional(),
  gstNumber: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/, "Invalid GST Number").optional().or(z.literal("")),
});

export type CheckoutFormData = z.infer<typeof checkoutFormSchema>;

// Coupon schema
export const couponSchema = z
  .object({
    code: z
      .string()
      .min(3, "Coupon code must be at least 3 characters")
      .max(20, "Coupon code must be at most 20 characters")
      .regex(
        /^[A-Z0-9_-]+$/,
        "Coupon code must contain only uppercase letters, numbers, hyphens, and underscores"
      ),
    type: z.enum(["PERCENTAGE", "FLAT"], { required_error: "Coupon type is required" }),
    value: z.number().positive("Value must be greater than 0"),
    minOrderValue: z.number().min(0).optional().nullable(),
    maxDiscount: z.number().min(0).optional().nullable(),
    isActive: z.boolean().default(true),
    expiresAt: z.date().optional().nullable(),
    globalUsageLimit: z.number().int().min(1).optional().nullable(),
    perUserLimit: z.number().int().min(1).optional().nullable(),
  })
  .refine(
    (data) => {
      if (data.type === "PERCENTAGE" && data.value > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage discount cannot exceed 100%",
      path: ["value"],
    }
  );

export type CouponFormData = z.infer<typeof couponSchema>;
