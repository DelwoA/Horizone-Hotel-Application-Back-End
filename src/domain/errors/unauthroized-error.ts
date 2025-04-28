/**
 * Custom error class for 401 Unauthorized errors
 * Used when a user is not authenticated or their authentication is invalid
 */

class UnauthorizedError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnauthorizedError";
  }
}

export default UnauthorizedError;
