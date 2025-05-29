import "dotenv/config";
import express from "express";
import connectDB from "./infrastructure/db";

import hotelsRouter from "./api/hotel";
import bookingsRouter from "./api/booking";
import paymentRouter from "./api/payment";
import cors from "cors";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handling-middleware";
import { clerkMiddleware } from "@clerk/express";

/**
 * Main application entry point
 * Sets up Express server with all necessary middleware and routes
 */

// Create an Express instance
const app = express();

// Add Clerk authentication middleware
app.use(clerkMiddleware());

// Special handling for Stripe webhook route (needs raw body)
// This is essential for Stripe webhook signature verification
// Stripe requires the raw request body to verify the webhook signature
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// Middleware to parse JSON data in the request body
app.use(express.json());

// Configure CORS to allow frontend domain
// This prevents cross-origin request issues between frontend and backend
// const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
// app.use(
//   cors({
//     origin: [FRONTEND_URL],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );
app.use(cors());

// Connect to MongoDB database
connectDB();

// Request logger middleware
// Logs HTTP method and path for each incoming request
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Register API routes
app.use("/api/hotels", hotelsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payment", paymentRouter);

// Add a redirect for payment verification to frontend
// This handles direct requests to the backend success URL (backup route)
// Stripe redirects users to the success URL specified in checkout session
app.get("/payment/success", (req, res) => {
  const sessionId = req.query.session_id;
  const bookingId = req.query.bookingId;

  console.log("Received direct payment success request with:", {
    sessionId,
    bookingId,
  });

  // Redirect to the payment verification page instead of directly to success
  // This ensures proper verification flow is followed
  res.redirect(
    `${process.env.FRONTEND_URL}/verify-payment?session_id=${sessionId}&bookingId=${bookingId}`
  );
});

// Register global error handling middleware
app.use(globalErrorHandlingMiddleware);

// Define the port to run the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
