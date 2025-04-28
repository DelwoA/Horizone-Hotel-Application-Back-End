import { Request, Response, NextFunction } from "express";
import ForbiddenError from "../../domain/errors/forbidden-error";

/**
 * Middleware to check if a user has admin role
 * Verifies if the authenticated user has the 'admin' role in session claims
 * Throws a ForbiddenError if the user is not an admin
 */
export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req?.auth?.sessionClaims?.metadata.role !== "admin") {
    throw new ForbiddenError("Forbidden");
  }

  next();
};
