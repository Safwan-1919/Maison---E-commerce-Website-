import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

// GET /api/admin/products?page=1&limit=20&search=&category=&brand=
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const brand = searchParams.get("brand") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { brand: { contains: search } },
        { category: { contains: search } },
      ];
    }
    if (category) where.category = category;
    if (brand) where.brand = brand;

    const [products, total] = await Promise.all([
      db.product.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { _count: { select: { reviews: true, orderItems: true } } },
      }),
      db.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Admin products fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}

const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  mrp: z.number().positive("MRP must be positive"),
  category: z.string().min(1, "Category is required"),
  brand: z.string().min(1, "Brand is required"),
  sizes: z.string().optional(),
  colors: z.string().optional(),
  images: z.string().optional(),
  stock: z.number().int().min(0).default(0),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  isTrending: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isFlashDeal: z.boolean().default(false),
  discount: z.number().min(0).default(0),
  material: z.string().optional(),
  care: z.string().optional(),
  tags: z.string().optional(),
});

// POST /api/admin/products - Create product (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createProductSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    const existing = await db.product.findUnique({ where: { slug: parsed.data.slug } });
    if (existing) {
      return NextResponse.json({ error: "A product with this slug already exists" }, { status: 409 });
    }

    const product = await db.product.create({
      data: {
        ...parsed.data,
        sizes: parsed.data.sizes || "[]",
        colors: parsed.data.colors || "[]",
        images: parsed.data.images || "[]",
      },
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Product creation error:", error);
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 });
  }
}

// PATCH /api/admin/products - Update product (admin only)
export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const { id, ...rawFields } = body;

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    // Verify product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Whitelist of allowed update fields
    const allowedFields = [
      "name", "slug", "description", "price", "mrp", "category", "brand",
      "sizes", "colors", "images", "stock", "isFeatured", "isNew",
      "isTrending", "isBestSeller", "isFlashDeal", "discount",
      "material", "care", "tags", "categoryId", "brandId",
    ];

    const fields: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in rawFields) {
        fields[key] = rawFields[key];
      }
    }

    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const product = await db.product.update({
      where: { id },
      data: fields,
    });

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Product update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products - Delete product (admin only)
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const { id } = body as { id: string };

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    // Verify product exists
    const existing = await db.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await db.product.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Product deletion error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}