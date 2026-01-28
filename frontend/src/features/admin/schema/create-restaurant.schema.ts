// create-restaurant.schema.ts
import { z } from "zod";

// Simple opening hours schema - all fields nullable
const openingHoursSchema = z.object({
  open: z.string().nullable().optional(),
  close: z.string().nullable().optional(),
  isClosed: z.boolean().nullable().optional(),
}).nullable().optional();

// Simple address schema - all fields nullable
const addressSchema = z.object({
  street: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  zipCode: z.string().nullable().optional(),
}).nullable().optional();

// Main schema - ALL FIELDS NULLABLE
export const restaurantCreateSchema = z.object({
  // Basic fields - can be null/undefined
  name: z.string().min(1, "Name is required").nullable(),
  location: z.string().min(1, "Location is required").nullable(),
  phone: z.string().min(1, "Phone is required").nullable(),
  email: z.string().email("Invalid email").nullable(),
  description: z.string().min(1, "Description is required").nullable(),
  
  // Number fields with defaults
  priceRange: z.number().min(1).max(5).nullable().optional(),
  deliveryFee: z.number().min(0).default(0).nullable().optional(),
  
  // Boolean field with default
  isOpen: z.boolean().default(true).nullable().optional(),
  
  // Array fields
  cuisineIds: z.array(z.string()).min(1, "Select at least one cuisine"),
  serviceType: z.array(z.enum(["dine-in", "takeaway", "delivery"])).min(1, "Select at least one service"),
  
  // Optional fields
  slug: z.string().nullable().optional(),
  openingHours: openingHoursSchema,
  address: addressSchema,
});

export type RestaurantCreateFormData = z.infer<typeof restaurantCreateSchema>;