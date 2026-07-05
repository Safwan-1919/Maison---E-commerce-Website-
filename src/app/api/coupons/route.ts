import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// GET /api/coupons - Admin only, returns all coupons
export async function GET() {
  try {
    await requireAdmin();
    const coupons = await db.coupon.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ coupons });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (error.message === "Forbidden") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    return NextResponse.json({ error: "Failed to fetch coupons" }, { status: 500 });
  }
}

// POST /api/coupons - Create coupon (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { code, type, discount, minOrder, maxUses, expiresAt, isActive } = body;

    if (!code || !type || discount === undefined) {
      return NextResponse.json({ error: "Code, type, and discount are required" }, { status: 400 });
    }

    const existing = await db.coupon.findUnique({ where: { code: code.toUpperCase() } });
    if (existing) return NextResponse.json({ error: "Coupon code already exists" }, { status: 400 });

    const coupon = await db.coupon.create({
      data: {
        code: code.toUpperCase(),
        type,
        discount: Number(discount),
        minOrder: minOrder ? Number(minOrder) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized") return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (message === "Forbidden") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    console.error("Coupon create error:", error);
    return NextResponse.json({ error: "Failed to create coupon" }, { status: 500 });
  }
}

// PUT /api/coupons - Update coupon
export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });

    const data: Record<string, unknown> = {};
    if (updates.code !== undefined) data.code = updates.code.toUpperCase();
    if (updates.type !== undefined) data.type = updates.type;
    if (updates.discount !== undefined) data.discount = Number(updates.discount);
    if (updates.minOrder !== undefined) data.minOrder = updates.minOrder ? Number(updates.minOrder) : null;
    if (updates.maxUses !== undefined) data.maxUses = updates.maxUses ? Number(updates.maxUses) : null;
    if (updates.expiresAt !== undefined) data.expiresAt = updates.expiresAt ? new Date(updates.expiresAt) : null;
    if (updates.isActive !== undefined) data.isActive = updates.isActive;

    const coupon = await db.coupon.update({ where: { id }, data });
    return NextResponse.json({ success: true, coupon });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (error.message === "Forbidden") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    return NextResponse.json({ error: "Failed to update coupon" }, { status: 500 });
  }
}

// DELETE /api/coupons - Delete coupon
export async function DELETE(request: NextRequest) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Coupon ID is required" }, { status: 400 });

    await db.coupon.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized") return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    if (error.message === "Forbidden") return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    return NextResponse.json({ error: "Failed to delete coupon" }, { status: 500 });
  }
}
