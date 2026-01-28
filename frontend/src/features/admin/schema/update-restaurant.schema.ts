import { z } from "zod";

// Create strict schemas for validation
const strictOpeningHoursSchema = z.object({
  open: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  close: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/),
  isClosed: z.boolean().default(false),
});

// Loose schemas for updates (all fields optional)
const looseOpeningHoursSchema = strictOpeningHoursSchema.partial();

const looseAddressSchema = z.object({
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  zipCode: z.string().optional(),
  coordinates: z.object({
    type: z.literal("Point").optional(),
    coordinates: z.array(z.number()).optional(),
  }).optional(),
}).optional();

// Main update schema - all fields optional
export const restaurantUpdateSchema = z.object({
  name: z.string()
    .min(1)
    .max(100)
    .trim()
    .optional(),

  slug: z.string()
    .toLowerCase()
    .trim()
    .optional(),

  location: z.string()
    .trim()
    .optional(),

  phone: z.string()
    .regex(/^[\+]?[1-9][\d]{0,15}$/)
    .transform(val => val?.replace(/[\s\-\(\)]/g, "") || "")
    .optional(),

  email: z.string()
    .email()
    .toLowerCase()
    .trim()
    .optional(),

  description: z.string()
    .max(1000)
    .optional(),

  cuisineIds: z.array(z.string().min(1))
    .optional(),

  priceRange: z.number()
    .min(1)
    .max(5)
    .optional(),

  serviceType: z.array(z.enum(["dine-in", "takeaway", "delivery"]))
    .optional(),

  openingHours: z.object({
    monday: looseOpeningHoursSchema,
    tuesday: looseOpeningHoursSchema,
    wednesday: looseOpeningHoursSchema,
    thursday: looseOpeningHoursSchema,
    friday: looseOpeningHoursSchema,
    saturday: looseOpeningHoursSchema,
    sunday: looseOpeningHoursSchema,
  }).partial().optional(),

  deliveryFee: z.number()
    .min(0)
    .optional(),

  isOpen: z.boolean().optional(),

  address: looseAddressSchema,

  logo: z.any().optional(),
  coverImage: z.any().optional(),

  status: z.enum(["pending", "active", "suspended", "closed"])
    .optional(),
});

export type RestaurantUpdateFormData = z.infer<typeof restaurantUpdateSchema>;
