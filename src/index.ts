import "dotenv/config";
import express from "express";
import connectDB from "./infrastructure/db";

import hotelsRouter from "./api/hotel";
import bookingsRouter from "./api/booking";
import cors from "cors";
import globalErrorHandlingMiddleware from "./api/middlewares/global-error-handling-middleware";
import { clerkMiddleware } from "@clerk/express";

// Create an Express instance
const app = express();

app.use(clerkMiddleware());
// Middleware to parse JSON data in the request body
app.use(express.json());
app.use(cors());

connectDB();

app.use((req, res, next) => {
  console.log("Hello World!");
  next();
});

app.use("/api/hotels", hotelsRouter);
app.use("/api/bookings", bookingsRouter);

app.use(globalErrorHandlingMiddleware);

// Define the port to run the server
const PORT = 8000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}...`));
