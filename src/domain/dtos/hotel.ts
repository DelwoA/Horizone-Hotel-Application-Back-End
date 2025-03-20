import { z } from "zod";

// DTO -> Domain Transfer Object

export const createHotelDTO = z.object({
  name: z.string(),
  location: z.string(),
  image: z.string(),
  price: z.string(),
  description: z.string(),
});

export const updateHotelDTO = z.object({
  name: z.string(),
  location: z.string(),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  image: z.string(),
  price: z.string(),
  description: z.string(),
});
