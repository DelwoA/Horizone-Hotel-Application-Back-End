/**
 * Custom error class for 400 Bad Request errors
 * Used when request data fails validation against defined schemas
 */

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export default ValidationError;
