import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const createReviewSchema = z.object({
  productId: z.string().min(1, "productId is required"),
  rating: z.number().int().min(1).max(5, "Rating must be between 1 and 5"),
  title: z.string().optional(),
  comment: z.string().optional(),
});

// GET /api/reviews?productId=xxx
// Returns reviews with averageRating, totalCount, and distribution
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "productId query parameter is required" },
        { status: 400 }
      );
    }

    // Verify the product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Fetch reviews (max 50), sorted by newest first
    const reviews = await db.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get total count and distribution in one query using groupBy
    const allReviewStats = await db.review.groupBy({
      by: ["rating"],
      where: { productId },
      _count: { rating: true },
    });

    // Build distribution object { 5: count, 4: count, 3: count, 2: count, 1: count }
    const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalCount = 0;

    for (const stat of allReviewStats) {
      distribution[stat.rating] = stat._count.rating;
      totalCount += stat._count.rating;
    }

    // Calculate average rating
    const averageRating =
      totalCount > 0
        ? Math.round(
            (allReviewStats.reduce((sum, stat) => sum + stat.rating * stat._count.rating, 0) /
              totalCount) *
              10
          ) / 10
        : 0;

    return NextResponse.json({
      reviews,
      averageRating,
      totalCount,
      distribution,
    });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST /api/reviews
// Submit a new review (authenticated)
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { productId, rating, title, comment } = parsed.data;

    // Verify the product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Verify the user has a delivered order containing this product
    const hasPurchased = await db.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId: user.id,
          status: { in: ["delivered", "shipped", "confirmed", "processing"] },
        },
      },
    });

    if (!hasPurchased) {
      return NextResponse.json(
        { error: "You can only review products you have purchased" },
        { status: 403 }
      );
    }

    // Check if user already reviewed this product
    const existingReview = await db.review.findFirst({
      where: { productId, userId: user.id },
    });

    if (existingReview) {
      return NextResponse.json({ error: "You have already reviewed this product" }, { status: 409 });
    }

    // Create the review
    const review = await db.review.create({
      data: {
        productId,
        userId: user.id,
        userName: user.name || "Anonymous",
        rating,
        title: title?.trim() || null,
        comment: comment?.trim() || null,
      },
    });

    // Update the product's aggregate rating and review count
    const stats = await db.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { id: true },
    });

    await db.product.update({
      where: { id: productId },
      data: {
        rating: Math.round((stats._avg.rating ?? 0) * 10) / 10,
        reviewCount: stats._count.id,
      },
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Review creation error:", error);
    return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
  }
}