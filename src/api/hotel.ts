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

const hotelsRouter = express.Router();

hotelsRouter
  .route("/")
  .get(getAllHotels)
  .post(isAuthenticated, isAdmin, createHotel);

// Specific routes must come BEFORE parameter routes
hotelsRouter.route("/filter").get(getFilteredSortedHotels);
hotelsRouter.route("/embeddings/create").post(createEmbeddings);
hotelsRouter.route("/search/retrieve").get(retrieve);

// Parameter routes should come AFTER specific routes
hotelsRouter
  .route("/:id")
  .get(getHotelById)
  .put(updateHotel)
  .delete(deleteHotel);

export default hotelsRouter;
