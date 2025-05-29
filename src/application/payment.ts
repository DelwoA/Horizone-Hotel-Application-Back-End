import { Request, Response, NextFunction } from "express";
import {
  createCheckoutSession,
  constructEventFromWebhook,
  retrieveCheckoutSession,
} from "../infrastructure/services/stripe";
import Booking from "../infrastructure/schemas/Booking";
import Hotel from "../infrastructure/schemas/Hotel";
import mongoose from "mongoose";
import { differenceInDays } from "date-fns";
import { getFrontendUrl } from "../infrastructure/utils/frontend-url";

/**
 * Create a Stripe checkout session for a hotel booking
 * This endpoint initiates the payment process by:
 * 1. Retrieving booking and hotel details from the database
 * 2. Calculating the total price based on number of nights
 * 3. Creating a Stripe checkout session with price and metadata
 * 4. Returning the session ID and checkout URL to the frontend
 */
export const createStripeCheckout = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId } = req.params;
    // Dynamically determine frontend URL based on request
    const FRONTEND_URL = getFrontendUrl(req);

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      res.status(400).json({ message: "Invalid booking ID" });
      return;
    }

    // Get the booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      res.status(404).json({ message: "Booking not found" });
      return;
    }

    // Check if booking is already paid
    if (booking.paymentStatus === "PAID") {
      res.status(400).json({ message: "Booking is already paid" });
      return;
    }

    // Get the hotel details to calculate price
    const hotel = await Hotel.findById(booking.hotelId);
    if (!hotel) {
      res.status(404).json({ message: "Hotel not found" });
      return;
    }

    // Calculate total price based on number of nights
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);
    const numberOfNights = Math.max(1, differenceInDays(checkOut, checkIn));
    const totalPriceInCents = Math.round(hotel.price * numberOfNights * 100); // Convert to cents

    // Create booking data for metadata
    const bookingData = {
      bookingId: booking._id.toString(),
      hotelId: booking.hotelId.toString(),
      userId: booking.userId,
    };

    // Success and cancel URLs - point to frontend application, not backend
    // The success URL includes the session ID as a query parameter which will be used
    // to verify payment status after redirect from Stripe
    const successUrl = `${FRONTEND_URL}/verify-payment?session_id={CHECKOUT_SESSION_ID}&bookingId=${booking._id.toString()}`;
    const cancelUrl = `${FRONTEND_URL}/hotels/${
      hotel._id
    }?paymentCancelled=true&bookingId=${booking._id.toString()}`;

    // Create a Stripe checkout session
    // This will return a session object with a URL to redirect the user to Stripe's hosted checkout page
    const session = await createCheckoutSession(
      totalPriceInCents,
      hotel.name,
      bookingData,
      successUrl,
      cancelUrl
    );

    // Return the session ID and URL
    res.status(200).json({
      sessionId: session.id,
      sessionUrl: session.url,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    next(error);
  }
};

/**
 * Handle webhook events from Stripe
 * This endpoint receives event notifications from Stripe when payment status changes
 * The key steps are:
 * 1. Verify the webhook signature to ensure it's from Stripe
 * 2. Process different event types (checkout.session.completed, etc.)
 * 3. Update the booking status in our database when payment is confirmed
 *
 * Note: This endpoint must be publicly accessible and receive the raw request body
 */
export const handleStripeWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers["stripe-signature"] as string;

  if (!signature) {
    console.log("Webhook received without signature");
    res.status(400).json({ message: "Stripe signature missing" });
    return;
  }

  try {
    console.log(
      "Webhook received with signature",
      signature.substring(0, 20) + "..."
    );

    // Get the raw body as a string
    // Note: Express must be configured with { raw: true } for this route to preserve the raw body
    const payload = req.body.toString();

    // Verify the webhook signature using the Stripe webhook secret
    // This ensures the event is actually from Stripe and not a malicious actor
    const event = constructEventFromWebhook(payload, signature);
    console.log("Webhook event type:", event.type);

    // Handle the event based on its type
    switch (event.type) {
      case "checkout.session.completed":
        const session = event.data.object as any;
        console.log("Checkout session completed, metadata:", session.metadata);

        // Update booking payment status
        // The bookingId was stored in the session metadata when creating the checkout
        if (session.metadata?.bookingId) {
          const bookingId = session.metadata.bookingId;
          console.log(`Updating booking ${bookingId} to PAID status`);

          const updatedBooking = await Booking.findByIdAndUpdate(
            bookingId,
            {
              paymentStatus: "PAID",
              paymentMethod: "CARD",
            },
            { new: true } // Return the updated document
          );

          if (updatedBooking) {
            console.log(`Booking ${bookingId} updated successfully`);
          } else {
            console.error(`Booking ${bookingId} not found for payment update`);
          }
        } else {
          console.error("No bookingId found in session metadata", session);
        }
        break;

      case "payment_intent.succeeded":
        console.log("Payment intent succeeded");
        // If you're using payment intents directly, handle them here
        break;

      // You can handle other event types as needed
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    // This is important to tell Stripe the webhook was processed successfully
    // If Stripe doesn't receive a 200 response, it will retry the webhook
    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(400).json({ message: "Webhook error" });
  }
};

/**
 * Verify the payment status of a booking
 */
export const verifyPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { bookingId } = req.params;
    console.log(`Verifying payment status for booking: ${bookingId}`);

    if (!bookingId) {
      console.log("No booking ID provided");
      res.status(400).json({ message: "Booking ID is required" });
      return;
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      console.log(`Invalid booking ID format: ${bookingId}`);
      res.status(400).json({ message: "Invalid booking ID format" });
      return;
    }

    // Get the booking details
    const booking = await Booking.findById(bookingId);
    if (!booking) {
      console.log(`Booking not found with ID: ${bookingId}`);
      res.status(404).json({
        message: "Booking not found",
        bookingId,
      });
      return;
    }

    console.log(`Booking found. Payment status: ${booking.paymentStatus}`);

    // Return the payment status
    res.status(200).json({
      paymentStatus: booking.paymentStatus,
      bookingId: booking._id,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      firstName: booking.firstName,
      lastName: booking.lastName,
    });
  } catch (error) {
    console.error("Error verifying payment status:", error);
    next(error);
  }
};

/**
 * Check payment status directly with Stripe
 * This endpoint provides a way to verify payment status immediately after redirect
 * from Stripe, without waiting for the webhook to be processed
 *
 * The main steps are:
 * 1. Get the session ID from the request parameters
 * 2. Retrieve the session details directly from Stripe
 * 3. Update the booking payment status in our database if needed
 * 4. Return the payment status to the frontend
 */
export const checkStripeSessionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      console.log("No session ID provided");
      res.status(400).json({ message: "Session ID is required" });
      return;
    }

    console.log(`Checking Stripe session status for: ${sessionId}`);

    // Get the session details directly from Stripe
    // This is a direct API call to Stripe to check the current payment status
    const sessionDetails = await retrieveCheckoutSession(sessionId);

    // If we have metadata with booking ID, update our database
    if (sessionDetails.metadata?.bookingId) {
      const bookingId = sessionDetails.metadata.bookingId;

      // If payment is successful, update the booking status
      // This ensures the booking is marked as paid even if the webhook hasn't been processed yet
      if (sessionDetails.paymentStatus === "paid") {
        console.log(`Payment successful, updating booking ${bookingId}`);

        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: "PAID",
          paymentMethod: "CARD",
        });
      }

      // Get the updated booking with payment status and hotel information
      const booking = await Booking.findById(bookingId).populate("hotelId");

      if (!booking) {
        res.status(404).json({
          success: false,
          message: "Booking not found",
          bookingId,
          stripeSessionStatus: sessionDetails.status,
          stripePaymentStatus: sessionDetails.paymentStatus,
        });
        return;
      }

      // Return complete booking information with Stripe payment status
      res.status(200).json({
        success: true,
        booking: {
          id: booking._id,
          checkIn: booking.checkIn,
          checkOut: booking.checkOut,
          firstName: booking.firstName,
          lastName: booking.lastName,
          roomNumber: booking.roomNumber,
          paymentStatus: booking.paymentStatus,
          hotelName: (booking.hotelId as any)?.name || "Hotel Booking",
        },
        stripeSessionStatus: sessionDetails.status,
        stripePaymentStatus: sessionDetails.paymentStatus,
      });
      return;
    }

    // If no booking ID in metadata, just return the Stripe session status
    res.status(200).json({
      success: true,
      message: "No booking ID in metadata",
      stripeSessionStatus: sessionDetails.status,
      stripePaymentStatus: sessionDetails.paymentStatus,
    });
  } catch (error) {
    console.error("Error checking Stripe session status:", error);
    next(error);
  }
};
