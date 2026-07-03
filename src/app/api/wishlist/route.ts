import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

const addWishlistSchema = z.object({
  productId: z.string().min(1, "productId is required"),
});

const removeWishlistSchema = z.object({
  productId: z.string().min(1, "productId is required"),
});

// GET /api/wishlist - Get user's wishlist items
export async function GET() {
  try {
    const user = await requireAuth();

    const wishlistItems = await db.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            price: true,
            mrp: true,
            images: true,
            category: true,
            brand: true,
            rating: true,
            reviewCount: true,
            discount: true,
            stock: true,
            isNew: true,
            isTrending: true,
            isBestSeller: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const enrichedItems = wishlistItems.map((item) => {
      const p = item.product;
      const imgs = typeof p.images === "string" ? JSON.parse(p.images) : (Array.isArray(p.images) ? p.images : []);
      return {
        ...item,
        product: { ...p, image: imgs[0] || "" },
      };
    });

    return NextResponse.json({ wishlistItems: enrichedItems });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Wishlist fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch wishlist" }, { status: 500 });
  }
}

// POST /api/wishlist - Add to wishlist
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = addWishlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { productId } = parsed.data;

    // Verify product exists
    const product = await db.product.findUnique({
      where: { id: productId },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if already in wishlist
    const existing = await db.wishlistItem.findFirst({
      where: { userId: user.id, productId },
    });
    if (existing) {
      return NextResponse.json({ success: true, message: "Already in wishlist" });
    }

    const wishlistItem = await db.wishlistItem.create({
      data: { userId: user.id, productId },
    });

    return NextResponse.json({ success: true, wishlistItem }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Wishlist add error:", error);
    return NextResponse.json({ error: "Failed to add to wishlist" }, { status: 500 });
  }
}

// DELETE /api/wishlist - Remove from wishlist
export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = removeWishlistSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { productId } = parsed.data;

    const deleted = await db.wishlistItem.deleteMany({
      where: { userId: user.id, productId },
    });

    if (deleted.count === 0) {
      return NextResponse.json({ error: "Item not found in wishlist" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Removed from wishlist" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Wishlist remove error:", error);
    return NextResponse.json({ error: "Failed to remove from wishlist" }, { status: 500 });
  }
}