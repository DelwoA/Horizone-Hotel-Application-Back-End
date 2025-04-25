import "dotenv/config";
import express from "express";
import connectDB from "./infrastructure/db";

import hotelsRouter from "./api/hotel";
import bookingsRouter from "./api/booking";
import paymentRouter from "./api/payment";
import cors from "cors";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handling-middleware";
import { clerkMiddleware } from "@clerk/express";

// Create an Express instance
const app = express();

app.use(clerkMiddleware());

// Special handling for Stripe webhook route (needs raw body)
// This is essential for Stripe webhook signature verification
// Stripe requires the raw request body to verify the webhook signature
app.use("/api/payment/webhook", express.raw({ type: "application/json" }));

// Middleware to parse JSON data in the request body
app.use(express.json());

// Configure CORS to allow frontend domain
// TODO: Double check if dynamic frontend url is working with localhost and production url.
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
app.use(
  cors({
    origin: [FRONTEND_URL],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

connectDB();

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

app.use("/api/hotels", hotelsRouter);
app.use("/api/bookings", bookingsRouter);
app.use("/api/payment", paymentRouter);

// Add a redirect for payment success to frontend
// This handles direct requests to the backend success URL (backup route)
// Stripe redirects users to the success URL specified in checkout session
app.get("/payment/success", (req, res) => {
  const sessionId = req.query.session_id;
  const bookingId = req.query.bookingId;

  console.log("Received direct payment success request with:", {
    sessionId,
    bookingId,
  });

  // Include both session ID and booking ID in the redirect URL
  // This ensures the frontend has all the information needed to verify payment
  res.redirect(
    `${FRONTEND_URL}/payment/success?session_id=${sessionId}&bookingId=${bookingId}`
  );
});

app.use(globalErrorHandlingMiddleware);

// Define the port to run the server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
