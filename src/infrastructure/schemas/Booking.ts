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
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  roomNumber: {
    type: Number,
    required: true,
  },
  paymentStatus: {
    type: String,
    enum: ["PENDING", "PAID"],
    default: "PENDING",
    // This field tracks the payment status of the booking
    // PENDING: Initial state, payment not yet completed
    // PAID: Payment has been successfully processed through Stripe
  },
  paymentMethod: {
    type: String,
    enum: ["CARD", "BANK_TRANSFER"],
    default: "CARD",
    // Payment method used for this booking
    // CARD: Paid using credit/debit card via Stripe
    // BANK_TRANSFER: Alternative payment method (not implemented with Stripe)
  },
});

const Booking = mongoose.model("Booking", BookingSchema);
export default Booking;
