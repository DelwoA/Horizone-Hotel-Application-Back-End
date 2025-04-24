import mongoose from "mongoose";

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  reviews: {
    type: Number,
  },
  image: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  stripePriceId: {
    type: String,
    required: true,
    // This field stores the Stripe Price ID associated with this hotel
    // It's used to create checkout sessions with the correct pricing
  },
});

const Hotel = mongoose.model("Hotel", HotelSchema);
export default Hotel;
