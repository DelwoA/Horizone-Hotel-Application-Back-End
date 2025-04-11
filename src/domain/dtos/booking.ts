import { z } from "zod";

export const createBookingDTO = z.object({
  hotelId: z.string(),
  checkIn: z.string(),
  checkOut: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string(),
  phoneNumber: z.string(),
  roomNumber: z.number(),
});
