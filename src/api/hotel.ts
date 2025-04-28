import express from "express";
import {
  getAllHotels,
  getHotelById,
  createHotel,
  deleteHotel,
  updateHotel,
  getFilteredSortedHotels,
} from "../application/hotel";
import { isAuthenticated } from "./middlewares/authentication-middleware";
import { isAdmin } from "./middlewares/authorization-middleware";
import { createEmbeddings } from "../application/embedding";
import { retrieve } from "../application/retrieve";

/**
 * Express router for hotel-related endpoints
 * Handles CRUD operations for hotels and hotel search functionality
 */
const hotelsRouter = express.Router();

// Base hotel routes
// GET: Retrieve all hotels (no authentication required)
// POST: Create a new hotel (requires authentication and admin role)
hotelsRouter
  .route("/")
  .get(getAllHotels)
  .post(isAuthenticated, isAdmin, createHotel);

// Specific routes must come BEFORE parameter routes
// GET /filter: Retrieve hotels with filtering and sorting options
hotelsRouter.route("/filter").get(getFilteredSortedHotels);
// POST /embeddings/create: Generate embeddings for hotel data
hotelsRouter.route("/embeddings/create").post(createEmbeddings);
// GET /search/retrieve: Perform semantic search on hotels
hotelsRouter.route("/search/retrieve").get(retrieve);

// Parameter routes should come AFTER specific routes
// Routes for operations on a specific hotel by ID
// GET: Retrieve a hotel by ID
// PUT: Update a hotel by ID
// DELETE: Remove a hotel by ID
hotelsRouter
  .route("/:id")
  .get(getHotelById)
  .put(updateHotel)
  .delete(deleteHotel);

export default hotelsRouter;
