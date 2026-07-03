import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/search?q=searchterm
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q");

    if (!q || q.trim().length === 0) {
      return NextResponse.json({ products: [], total: 0 });
    }

    const searchTerm = q.trim();

    const products = await db.product.findMany({
      where: {
        OR: [
          { name: { contains: searchTerm } },
          { description: { contains: searchTerm } },
          { tags: { contains: searchTerm } },
          { brand: { contains: searchTerm } },
          { category: { contains: searchTerm } },
        ],
      },
      take: 10,
      orderBy: { reviewCount: "desc" },
    });

    const enrichedProducts = products.map((p) => {
      const imgs = typeof p.images === "string" ? JSON.parse(p.images) : (Array.isArray(p.images) ? p.images : []);
      return {
        id: p.id,
        name: p.name,
        price: p.price,
        mrp: p.mrp,
        image: imgs[0] || "",
        category: p.category,
        brand: p.brand,
        slug: p.slug,
        rating: p.rating,
        reviewCount: p.reviewCount,
        discount: p.discount,
      };
    });

    return NextResponse.json({
      products: enrichedProducts,
      total: enrichedProducts.length,
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}