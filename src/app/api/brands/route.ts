import { db } from "@/lib/db";
import { NextResponse } from "next/server";

// GET /api/brands
export async function GET() {
  try {
    const brands = await db.brand.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { products: true } } },
    });

    const result = brands.map((brand) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      productCount: brand._count.products,
    }));

    return NextResponse.json({ brands: result });
  } catch (error) {
    console.error("Brands fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch brands" }, { status: 500 });
  }
}