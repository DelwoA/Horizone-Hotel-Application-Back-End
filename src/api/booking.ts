import express from "express";
import { isAuthenticated } from "./middlewares/authentication-middleware";
import {
  createBooking,
  getAllBookings,
  getAllBookingsForHotel,
  getAllBookingsForUser,
} from "../application/booking";

const bookingsRouter = express.Router();

bookingsRouter
  .route("/")
  .get(isAuthenticated, getAllBookings)
  .post(isAuthenticated, createBooking);
bookingsRouter
  .route("/hotels/:hotelId")
  .get(isAuthenticated, getAllBookingsForHotel);
bookingsRouter
  .route("/user/:userId?")
  .get(isAuthenticated, getAllBookingsForUser);

export default bookingsRouter;
