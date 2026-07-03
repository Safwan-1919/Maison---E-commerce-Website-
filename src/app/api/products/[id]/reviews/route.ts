import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/products/[id]/reviews?page=1&limit=10
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Verify product exists (try slug first, then id)
    let product = await db.product.findUnique({ where: { slug: productId }, select: { id: true } });
    if (!product) {
      product = await db.product.findUnique({ where: { id: productId }, select: { id: true } });
    }
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.review.count({ where: { productId: product.id } }),
    ]);

    return NextResponse.json({
      reviews,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Product reviews fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}