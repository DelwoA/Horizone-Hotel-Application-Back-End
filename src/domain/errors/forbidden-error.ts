/**
 * Custom error class for 403 Forbidden errors
 * Used when a user attempts to access a resource they don't have permission for
 */

class ForbiddenError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
}

export default ForbiddenError;
