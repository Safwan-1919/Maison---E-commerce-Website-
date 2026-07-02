import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await db.product.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get similar products
    const similar = await db.product.findMany({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              { category: product.category },
              { brand: product.brand },
            ],
          },
        ],
      },
      take: 8,
      orderBy: { reviewCount: "desc" },
    });

    return NextResponse.json({ product, similar });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}