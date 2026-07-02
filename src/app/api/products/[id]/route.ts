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

    // Compute image from images array
    const imgs = typeof product.images === "string" ? JSON.parse(product.images) : (Array.isArray(product.images) ? product.images : []);
    const enrichedProduct = { ...product, image: imgs[0] || "" };

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

    const enrichedSimilar = similar.map((p) => {
      const pImgs = typeof p.images === "string" ? JSON.parse(p.images) : (Array.isArray(p.images) ? p.images : []);
      return { ...p, image: pImgs[0] || "" };
    });

    return NextResponse.json({ product: enrichedProduct, similar: enrichedSimilar });
  } catch (error) {
    console.error("Product fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}