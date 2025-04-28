import { Request, Response, NextFunction } from "express";
import UnauthorizedError from "../../domain/errors/unauthroized-error";

/**
 * Middleware to verify if a user is authenticated
 * Checks for the presence of a userId in the auth object (provided by Clerk)
 * Throws an UnauthorizedError if the user is not authenticated
 */
export const isAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req?.auth.userId) {
    throw new UnauthorizedError("Unauthorized");
  }

  next();
};
