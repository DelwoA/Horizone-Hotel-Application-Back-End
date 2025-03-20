import mongoose from "mongoose";
import { string } from "zod";

const BookingSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  roomNumber: {
    type: Number,
    required: true,
  },
});

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
