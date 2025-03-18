import mongoose from "mongoose";

const BookingSchema = new mongoose.Schema({
  hotelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Hotel",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
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
