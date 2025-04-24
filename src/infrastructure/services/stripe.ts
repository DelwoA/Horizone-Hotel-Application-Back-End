import Stripe from "stripe";
import dotenv from "dotenv";

// Load environment variables from .env file to access Stripe API keys
dotenv.config();

// Initialize Stripe with the secret key from environment variables
// This creates a configured Stripe client that can interact with the Stripe API
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "");

/**
 * Create a payment intent for a hotel booking
 * A PaymentIntent tracks the customer's payment lifecycle, handling confirmation, authentication, and errors
 *
 * @param amount Amount in cents (Stripe uses smallest currency unit)
 * @param currency Currency code (default: USD)
 * @param metadata Additional metadata for tracking the payment in your system
 * @returns Stripe PaymentIntent object with client_secret for frontend confirmation
 */
export const createPaymentIntent = async (
  amount: number,
  currency: string = "usd",
  metadata: Record<string, string> = {}
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: { enabled: true }, // Enables all available payment methods
    });

    return paymentIntent;
  } catch (error) {
    console.error("Error creating payment intent:", error);
    throw error;
  }
};

/**
 * Create a checkout session for a hotel booking
 * Checkout Sessions provide a pre-built, Stripe-hosted payment page that simplifies collecting payment details
 *
 * @param priceInCents Amount in cents (Stripe uses smallest currency unit)
 * @param hotelName Name of the hotel for display in checkout
 * @param bookingData Booking information to store as metadata
 * @param successUrl URL to redirect to on successful payment (includes session ID as query parameter)
 * @param cancelUrl URL to redirect to if payment is cancelled
 * @returns Stripe Checkout Session with URL to redirect the user to
 */
export const createCheckoutSession = async (
  priceInCents: number,
  hotelName: string,
  bookingData: any,
  successUrl: string,
  cancelUrl: string
) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], // Only accept card payments
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Booking for ${hotelName}`,
              description: `Check-in: ${new Date(
                bookingData.checkIn
              ).toLocaleDateString()} - Check-out: ${new Date(
                bookingData.checkOut
              ).toLocaleDateString()}`,
            },
            unit_amount: priceInCents, // Price in cents
          },
          quantity: 1,
        },
      ],
      mode: "payment", // One-time payment mode (vs. subscription)
      success_url: successUrl, // URL that Stripe will redirect to after successful payment
      cancel_url: cancelUrl, // URL that Stripe will redirect to if user cancels
      metadata: {
        // Store booking information in metadata for webhook processing
        bookingId: bookingData.bookingId,
        hotelId: bookingData.hotelId,
        userId: bookingData.userId,
      },
    });

    return session;
  } catch (error) {
    console.error("Error creating checkout session:", error);
    throw error;
  }
};

/**
 * Verify the webhook signature and return the event
 * This ensures webhook events are actually from Stripe by validating the signature
 *
 * @param payload Request body (raw string)
 * @param signature Stripe signature from the request header
 * @returns Stripe event if signature is valid
 */
export const constructEventFromWebhook = (
  payload: string,
  signature: string
) => {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error);
    throw error;
  }
};

/**
 * Retrieve and check a checkout session directly from Stripe
 * Used to verify payment status when redirected from Stripe Checkout
 *
 * @param sessionId The Stripe checkout session ID
 * @returns Session details including payment status
 */
export const retrieveCheckoutSession = async (sessionId: string) => {
  try {
    console.log(`Retrieving checkout session from Stripe: ${sessionId}`);
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    console.log(`Session payment status: ${session.payment_status}`);

    return {
      id: session.id,
      paymentStatus: session.payment_status,
      customerEmail: session.customer_details?.email,
      amountTotal: session.amount_total,
      metadata: session.metadata,
      paymentIntent: session.payment_intent,
      status: session.status,
    };
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    throw error;
  }
};
