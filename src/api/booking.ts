import express from "express";
import { isAuthenticated } from "./middlewares/authentication-middleware";
import {
  createBooking,
  getAllBookings,
  getAllBookingsForHotel,
  getAllBookingsForUser,
} from "../application/booking";

/**
 * Express router for booking-related endpoints
 * Handles booking creation and retrieval operations
 * All routes require authentication
 */
const bookingsRouter = express.Router();

// Base booking routes
// GET: Retrieve all bookings (requires authentication)
// POST: Create a new booking (requires authentication)
bookingsRouter
  .route("/")
  .get(isAuthenticated, getAllBookings)
  .post(isAuthenticated, createBooking);

// GET: Retrieve all bookings for a specific hotel
// Accessible only to authenticated users
bookingsRouter
  .route("/hotels/:hotelId")
  .get(isAuthenticated, getAllBookingsForHotel);

// GET: Retrieve all bookings for a specific user
// The userId parameter is optional - if not provided, uses the authenticated user's ID
bookingsRouter
  .route("/user/:userId?")
  .get(isAuthenticated, getAllBookingsForUser);

export default bookingsRouter;
