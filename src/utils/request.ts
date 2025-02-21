import { Request } from "express";

/**
 * Gets the client IP address from various request headers and properties
 * Handles cases where the request might be behind a proxy
 */
export function getClientIp(req: Request): string {
  // Check X-Forwarded-For header first (common for proxies)
  const forwardedFor = req.headers["x-forwarded-for"];
  if (forwardedFor) {
    // Get the first IP if multiple are present
    const ips = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor.split(",")[0].trim();
    return ips;
  }

  // Check Real-IP header (used by some proxies)
  const realIp = req.headers["x-real-ip"];
  if (realIp) {
    return Array.isArray(realIp) ? realIp[0] : realIp;
  }

  // Fall back to connection remote address
  return req.ip || "unknown";
}
