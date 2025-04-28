/// <reference types="@clerk/express/env" />

export {};

/**
 * Type definition for user roles in the application
 * Currently only supports 'admin' role
 */
export type Role = "admin";

/**
 * Global type declarations
 * Extends Clerk's JWT session claims with custom metadata
 */
declare global {
  /**
   * Extends Clerk's JWT session claims with custom metadata
   * Used to store role information for authorization
   */
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Role;
    };
  }
}
