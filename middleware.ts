import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect API routes
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
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
