import { z } from "zod";

/**
 * Data Transfer Objects (DTOs) for hotel-related operations
 * These schemas define the shape of data for creating and updating hotels
 */

/**
 * Schema for creating a new hotel
 * Defines the required fields and their types for hotel creation
 */
export const createHotelDTO = z.object({
  name: z.string(),
  location: z.string(),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  image: z.string(),
  price: z.number(),
  description: z.string(),
});

/**
 * Schema for updating an existing hotel
 * Extends the create schema with optional fields for rating and reviews
 */
export const updateHotelDTO = z.object({
  name: z.string(),
  location: z.string(),
  rating: z.number().optional(),
  reviews: z.number().optional(),
  image: z.string(),
  price: z.number(),
  description: z.string(),
});
