import express from "express";
import { createUser } from "../application/user";

const usersRouter = express.Router();

usersRouter.route("/").post(createUser);

export default usersRouter;
