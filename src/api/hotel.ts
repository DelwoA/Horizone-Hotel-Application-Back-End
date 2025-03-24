import express from "express";
import {
  getAllHotels,
  getHotelById,
  createHotel,
  deleteHotel,
  updateHotel,
} from "../application/hotel";
import { isAuthenticated } from "./middlewares/authentication-middleware";
import { isAdmin } from "./middlewares/authorization-middleware";
import { generateResponse } from "../application/hotel";

const hotelsRouter = express.Router();

// hotelsRouter.get("/", getAllHotels);
// hotelsRouter.get("/:id", getHotelById);
// hotelsRouter.post("/", createHotel);
// hotelsRouter.delete("/:id", deleteHotel);
// hotelsRouter.put("/:id", updateHotel);

hotelsRouter
  .route("/")
  .get(getAllHotels)
  .post(isAuthenticated, isAdmin, createHotel);
hotelsRouter
  .route("/:id")
  .get(getHotelById)
  .put(updateHotel)
  .delete(deleteHotel);
hotelsRouter.route("/llm").post(generateResponse);

export default hotelsRouter;
