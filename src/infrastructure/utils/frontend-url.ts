import { Request } from "express";

/**
 * Determine the frontend URL based on the request origin
 * This allows the backend to work with both development and production environments
 *
 * The function checks multiple headers in order of preference:
 * 1. Origin header (most reliable for CORS requests)
 * 2. Referer header (fallback for navigation requests)
 * 3. X-Forwarded-Host header (for proxied requests)
 * 4. Environment variable or default localhost
 *
 * @param req - Express request object
 * @returns The determined frontend URL
 */
export const getFrontendUrl = (req: Request): string => {
  // Check for Origin header first (most reliable)
  const origin = req.get("Origin");
  if (origin) {
    console.log(`Using Origin header for frontend URL: ${origin}`);
    return origin;
  }

  // Check for Referer header as fallback
  const referer = req.get("Referer");
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;
      console.log(`Using Referer header for frontend URL: ${refererOrigin}`);
      return refererOrigin;
    } catch (error) {
      console.warn("Invalid Referer header:", referer);
    }
  }

  // Check for X-Forwarded-Host header (useful for proxied requests)
  const forwardedHost = req.get("X-Forwarded-Host");
  const forwardedProto = req.get("X-Forwarded-Proto") || "https";
  if (forwardedHost) {
    const forwardedUrl = `${forwardedProto}://${forwardedHost}`;
    console.log(`Using X-Forwarded headers for frontend URL: ${forwardedUrl}`);
    return forwardedUrl;
  }

  // Fallback to environment variable or default
  const fallbackUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  console.log(`Using fallback frontend URL: ${fallbackUrl}`);
  return fallbackUrl;
};
