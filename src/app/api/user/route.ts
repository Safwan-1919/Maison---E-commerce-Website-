import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { z } from "zod";

// GET /api/user - Get current user profile
export async function GET() {
  try {
    const user = await requireAuth();

    const fullUser = await db.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        addresses: true,
        role: true,
        loyaltyPoints: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!fullUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user: fullUser });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("User fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  phone: z.string().optional(),
  addresses: z.any().optional(),
});

// PUT /api/user - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = updateUserSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
    if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
    if (parsed.data.addresses !== undefined) {
      updateData.addresses = typeof parsed.data.addresses === "string"
        ? parsed.data.addresses
        : JSON.stringify(parsed.data.addresses);
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatar: true,
        addresses: true,
        role: true,
        loyaltyPoints: true,
        isVerified: true,
        createdAt: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("User update error:", error);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}

// DELETE /api/user - Delete current user account
export async function DELETE() {
  try {
    const user = await requireAuth();

    // Delete user's data in order (handle foreign key constraints)
    await db.$transaction(async (tx) => {
      // Delete reviews
      await tx.review.deleteMany({ where: { userId: user.id } });
      // Delete wishlist items
      await tx.wishlistItem.deleteMany({ where: { userId: user.id } });
      // Delete notification preferences (if any)
      // Note: Orders are kept for historical records but user info is anonymized
      await tx.user.delete({ where: { id: user.id } });
    });

    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("User deletion error:", error);
    return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
  }
}