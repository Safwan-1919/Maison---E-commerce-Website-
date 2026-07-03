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

    // Enhanced filters
    const brands = searchParams.get("brands"); // comma-separated
    const categories = searchParams.get("categories"); // comma-separated
    const sizes = searchParams.get("sizes"); // comma-separated
    const colors = searchParams.get("colors"); // comma-separated
    const minRating = parseFloat(searchParams.get("minRating") || "0");
    const inStock = searchParams.get("inStock"); // "true" to filter in-stock only
    const minDiscount = parseFloat(searchParams.get("discount") || "0");

    const where: Record<string, unknown> = {};

    // Category filter (single or array)
    if (categories) {
      const cats = categories.split(",").map((c) => c.trim()).filter(Boolean);
      if (cats.length === 1) {
        where.category = cats[0];
      } else if (cats.length > 1) {
        where.category = { in: cats };
      }
    } else if (category && category !== "All") {
      where.category = category;
    }

    // Brand filter (single or array)
    if (brands) {
      const brs = brands.split(",").map((b) => b.trim()).filter(Boolean);
      if (brs.length === 1) {
        where.brand = brs[0];
      } else if (brs.length > 1) {
        where.brand = { in: brs };
      }
    } else if (brand && brand !== "All") {
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

    // Sizes filter (JSON contains check)
    if (sizes) {
      const sizeList = sizes.split(",").map((s) => s.trim()).filter(Boolean);
      if (sizeList.length === 1) {
        where.sizes = { contains: sizeList[0] };
      } else if (sizeList.length > 1) {
        where.OR = sizeList.map((s) => ({ sizes: { contains: s } }));
      }
    }

    // Colors filter (JSON contains check)
    if (colors) {
      const colorList = colors.split(",").map((c) => c.trim()).filter(Boolean);
      if (colorList.length === 1) {
        where.colors = { contains: colorList[0] };
      } else if (colorList.length > 1) {
        // Combine with existing OR if present
        const colorFilters = colorList.map((c) => ({ colors: { contains: c } }));
        if (where.OR) {
          where.AND = [
            { OR: where.OR },
            { OR: colorFilters },
          ];
          delete where.OR;
        } else {
          where.OR = colorFilters;
        }
      }
    }

    // Minimum rating filter
    if (minRating > 0) {
      where.rating = { gte: minRating };
    }

    // In-stock filter
    if (inStock === "true") {
      where.stock = { gt: 0 };
    }

    // Minimum discount filter
    if (minDiscount > 0) {
      where.discount = { gte: minDiscount };
    }

    type SortKey = "createdAt" | "price" | "rating" | "reviewCount" | "discount";
    type SortDir = "asc" | "desc";
    let orderBy: Record<string, SortDir> = { createdAt: "desc" };

    switch (sort) {
      case "price-low": orderBy = { price: "asc" }; break;
      case "price-high": orderBy = { price: "desc" }; break;
      case "rating": orderBy = { rating: "desc" }; break;
      case "newest": orderBy = { createdAt: "desc" }; break;
      case "popularity": orderBy = { reviewCount: "desc" }; break;
      case "discount": orderBy = { discount: "desc" }; break;
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