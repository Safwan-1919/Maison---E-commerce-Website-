import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    const coupon = await db.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ valid: false, message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ valid: false, message: "This coupon is no longer active" });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ valid: false, message: "This coupon has expired" });
    }

    if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
      return NextResponse.json({ valid: false, message: "This coupon has reached its usage limit" });
    }

    return NextResponse.json({
      valid: true,
      discount: coupon.discount,
      type: coupon.type,
      minOrder: coupon.minOrder,
    });
  } catch (error) {
    console.error("Coupon error:", error);
    return NextResponse.json({ valid: false, message: "Failed to validate coupon" }, { status: 500 });
  }
}