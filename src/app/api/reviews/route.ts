import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

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
// Submit a new review
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, userName, rating, title, comment } = body;

    // Validate required fields
    if (!productId) {
      return NextResponse.json(
        { error: "productId is required" },
        { status: 400 }
      );
    }

    if (!userName || typeof userName !== "string" || userName.trim().length === 0) {
      return NextResponse.json(
        { error: "userName is required" },
        { status: 400 }
      );
    }

    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: "rating is required" },
        { status: 400 }
      );
    }

    // Validate rating range
    const ratingValue = Number(rating);
    if (!Number.isInteger(ratingValue) || ratingValue < 1 || ratingValue > 5) {
      return NextResponse.json(
        { error: "rating must be an integer between 1 and 5" },
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

    // Create the review
    const review = await db.review.create({
      data: {
        productId,
        userName: userName.trim(),
        rating: ratingValue,
        title: title ? String(title).trim() : null,
        comment: comment ? String(comment).trim() : null,
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

    return NextResponse.json(
      { success: true, review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}