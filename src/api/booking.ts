import express from "express";
import {
  createBooking,
  getAllBookings,
  getAllBookingsForHotel,
} from "../application/booking";

const bookingsRouter = express.Router();

bookingsRouter.route("/").get(getAllBookings).post(createBooking);
bookingsRouter.route("/hotels/:hotelId").get(getAllBookingsForHotel);

export default bookingsRouter;
