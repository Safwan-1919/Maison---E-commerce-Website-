import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

// GET /api/categories?withCounts=true
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const withCounts = searchParams.get("withCounts") === "true";

    if (withCounts) {
      const categories = await db.category.findMany({
        orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
        include: { _count: { select: { products: true } } },
      });

      const result = categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        image: cat.image,
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
        image: true,
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

// PATCH /api/categories — update a category (admin)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }
    const allowed = ["name", "slug", "icon", "image", "description", "sortOrder"];
    const filtered: Record<string, any> = {};
    for (const key of allowed) {
      if (data[key] !== undefined) filtered[key] = data[key];
    }
    if (Object.keys(filtered).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }
    const updated = await db.category.update({ where: { id }, data: filtered });
    return NextResponse.json({ category: updated });
  } catch (error) {
    console.error("Category update error:", error);
    return NextResponse.json({ error: "Failed to update category" }, { status: 500 });
  }
}