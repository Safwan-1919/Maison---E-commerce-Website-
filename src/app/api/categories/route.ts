import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/categories?withCounts=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withCounts = searchParams.get("withCounts") === "true";

    if (withCounts) {
      // Use a single query with product count
      const categories = await db.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: true } } },
      });

      const result = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        productCount: cat._count.products,
        sortOrder: cat.sortOrder,
      }));

      return NextResponse.json({ categories: result });
    }

    const categories = await db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        description: true,
        sortOrder: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}