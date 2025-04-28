import { Request, Response, NextFunction } from "express";

/**
 * Global error handling middleware
 * Catches all errors thrown during request processing and returns appropriate HTTP responses
 *
 * Handles specific error types with their corresponding HTTP status codes:
 * - NotFoundError: 404 Not Found
 * - ValidationError: 400 Bad Request
 * - UnauthorizedError: 401 Unauthorized
 * - ForbiddenError: 403 Forbidden
 *
 * Any unhandled errors result in a 500 Internal Server Error response
 *
 * @param error - The error object caught by Express
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
const globalErrorHandlingMiddleware = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(error);
  if (error.name === "NotFoundError") {
    res.status(404).json({ message: error.message });
    return;
  }
  if (error.name === "ValidationError") {
    res.status(400).json({ message: error.message });
    return;
  }
  if (error.name === "UnauthorizedError") {
    res.status(401).json({ message: error.message });
    return;
  }
  if (error.name === "ForbiddenError") {
    res.status(403).json({ message: error.message });
    return;
  }
  res.status(500).json({ message: "Internal server error" });
  return;
};

export default globalErrorHandlingMiddleware;
