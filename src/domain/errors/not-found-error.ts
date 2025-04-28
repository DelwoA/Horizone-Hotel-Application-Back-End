/**
 * Custom error class for 404 Not Found errors
 * Used when a requested resource cannot be found in the database
 */

class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

export default NotFoundError;
