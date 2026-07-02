import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "popularity";
    const minPrice = parseFloat(searchParams.get("minPrice") || "0");
    const maxPrice = parseFloat(searchParams.get("maxPrice") || "999999");
    const featured = searchParams.get("featured");
    const trending = searchParams.get("trending");
    const bestSeller = searchParams.get("bestSeller");
    const flashDeal = searchParams.get("flashDeal");
    const isNew = searchParams.get("new");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "1");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (category && category !== "All") {
      where.category = category;
    }
    if (brand && brand !== "All") {
      where.brand = brand;
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { tags: { contains: search } },
        { brand: { contains: search } },
        { category: { contains: search } },
      ];
    }
    if (minPrice > 0 || maxPrice < 999999) {
      where.price = { gte: minPrice, lte: maxPrice };
    }
    if (featured === "true") where.isFeatured = true;
    if (trending === "true") where.isTrending = true;
    if (bestSeller === "true") where.isBestSeller = true;
    if (flashDeal === "true") where.isFlashDeal = true;
    if (isNew === "true") where.isNew = true;

    type SortKey = "createdAt" | "price" | "rating" | "reviewCount";
    type SortDir = "asc" | "desc";
    let orderBy: Record<string, SortDir> = { createdAt: "desc" };

    switch (sort) {
      case "price-low": orderBy = { price: "asc" }; break;
      case "price-high": orderBy = { price: "desc" }; break;
      case "rating": orderBy = { rating: "desc" }; break;
      case "newest": orderBy = { createdAt: "desc" }; break;
      case "popularity": orderBy = { reviewCount: "desc" }; break;
      default: orderBy = { createdAt: "desc" };
    }

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    // Add computed image field from images array
    const enrichedProducts = products.map((p) => {
      const imgs = typeof p.images === "string" ? JSON.parse(p.images) : (Array.isArray(p.images) ? p.images : []);
      return { ...p, image: imgs[0] || "" };
    });

    return NextResponse.json({
      products: enrichedProducts,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}