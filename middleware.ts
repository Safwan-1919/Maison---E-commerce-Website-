import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Simple in-memory rate limiter for middleware (Edge runtime compatible)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function middlewareRateLimit(key: string, maxRequests: number = 20, windowMs: number = 60000): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  if (entry.count >= maxRequests) return false;
  entry.count++;
  return true;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Rate limit sensitive endpoints
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (pathname.startsWith("/api/auth")) {
    if (!middlewareRateLimit(`auth:${ip}`, 15, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
  }
  if (pathname === "/api/coupons/validate" || pathname === "/api/coupons") {
    if (!middlewareRateLimit(`coupon:${ip}`, 30, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
  }
  if (pathname === "/api/orders" && request.method === "POST") {
    if (!middlewareRateLimit(`order:${ip}`, 10, 60000)) {
      return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
    }
  }

  // Public API routes that don't need auth
  const publicRoutes = [
    "/api/auth",
    "/api/products",
    "/api/categories",
    "/api/brands",
    "/api/search",
    "/api/testimonials",
    "/api/newsletter",
    "/api/coupons/validate",
    "/api/orders/track",
    "/api/site-content",
    "/api/reviews",
  ];

  const isPublicRoute = publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // If no token, return 401
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Admin-only API routes
  const adminRoutes = ["/api/admin", "/api/products/seed"];
  const isAdminRoute = adminRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (isAdminRoute && token.role !== "admin") {
    return NextResponse.json({ error: "Admin access required" }, { status: 403 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};
