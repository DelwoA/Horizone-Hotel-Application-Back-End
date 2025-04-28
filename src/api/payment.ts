import express from "express";
import { isAuthenticated } from "./middlewares/authentication-middleware";
import {
  createStripeCheckout,
  handleStripeWebhook,
  verifyPaymentStatus,
  checkStripeSessionStatus,
} from "../application/payment";

const paymentRouter = express.Router();

/**
 * Route for creating a Stripe checkout session
 * POST /api/payment/checkout/:bookingId
 *
 * This endpoint requires authentication and creates a Stripe checkout session for a booking
 * It returns a session ID and checkout URL that the frontend will redirect to
 */
paymentRouter
  .route("/checkout/:bookingId")
  .post(isAuthenticated, createStripeCheckout);

/**
 * Route for verifying booking payment status from our database
 * GET /api/payment/status/:bookingId
 *
 * This endpoint is public (no auth required) to allow checking payment status
 * after redirecting back from Stripe checkout
 */
paymentRouter.route("/status/:bookingId").get(verifyPaymentStatus);

/**
 * Route for checking Stripe session status directly
 * GET /api/payment/session/:sessionId
 *
 * This endpoint directly checks the payment status with Stripe using the session ID
 * It's used immediately after redirect from Stripe checkout to verify payment
 */
paymentRouter.route("/session/:sessionId").get(checkStripeSessionStatus);

/**
 * Route for handling Stripe webhook events
 * POST /api/payment/webhook
 *
 * This endpoint receives event notifications from Stripe when payment status changes
 * It must be public and receive the raw request body for signature verification
 * The raw body handling is configured in the main app index.ts file
 */
paymentRouter
  .route("/webhook")
  .post(express.raw({ type: "application/json" }), handleStripeWebhook);

export default paymentRouter;
