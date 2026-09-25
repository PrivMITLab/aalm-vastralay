import { z } from "zod";

const hrefAllowlistPattern = /^(\/products|\/stores|\/categories|\/onboarding|tel:|https:\/\/wa\.me|\/track-order|\/handbook|\/contact)/i;

export const heroSlideSchema = z.object({
  id: z.string().optional(),
  image: z.string().trim().min(1, "Slide image is required").max(600, "Image URL must not exceed 600 characters"),
  title: z.string().trim().max(120, "Title must not exceed 120 characters"),
  subtitle: z.string().trim().max(300).optional().default(""),
  badge: z.string().trim().max(50).optional().default(""),
  ctaLabel: z.string().trim().max(50).optional().default(""),
  ctaHref: z
    .string()
    .trim()
    .max(300)
    .refine((val) => !val || hrefAllowlistPattern.test(val), {
      message: "CTA link must point to internal paths (/products, /stores...), tel:, or WhatsApp",
    })
    .optional()
    .default("/products"),
  cta2Label: z.string().trim().max(50).optional().default(""),
  cta2Href: z
    .string()
    .trim()
    .max(300)
    .refine((val) => !val || hrefAllowlistPattern.test(val), {
      message: "Secondary CTA link must point to internal paths (/products, /stores...), tel:, or WhatsApp",
    })
    .optional()
    .default(""),
  alt: z.string().trim().max(120).optional().default(""),
  active: z.boolean().default(true),
  order: z.number().int().min(0).max(10).default(0),
  strategy: z.enum(["wsrv", "direct", "b2", "auto"]).optional().default("wsrv"),
  mirroredUrl: z.string().max(600).optional(),
  mirroredBytes: z.number().optional(),
  mirroredAt: z.string().optional(),
});

export const heroSlidesArraySchema = z.array(heroSlideSchema).max(5, "Maximum 5 slides permitted");
