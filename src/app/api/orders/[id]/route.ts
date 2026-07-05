import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth, requireAdmin } from "@/lib/auth";
import { z } from "zod";

const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled", "returned"];

// GET /api/orders/[id] - by orderNumber
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: orderNumber } = await params;

    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Users can only see their own orders, admins can see all
    if (user.role !== "admin" && order.userId !== user.id) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Order fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}

// PATCH /api/orders/[id] - Cancel order (owner or admin)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth();
    const { id: orderNumber } = await params;

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body as { status?: string };

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({ where: { orderNumber } });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Admin can update any order; regular users can only cancel their own confirmed/processing orders
    const isAdmin = user.role === "admin";
    const isOwner = order.userId === user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    if (!isAdmin) {
      // Regular users can only cancel, and only confirmed/processing orders
      if (status !== "cancelled") {
        return NextResponse.json({ error: "You can only cancel orders" }, { status: 403 });
      }
      if (!["confirmed", "processing"].includes(order.status)) {
        return NextResponse.json({ error: "This order can no longer be cancelled" }, { status: 400 });
      }
    }

    const updated = await db.order.update({
      where: { orderNumber },
      data: { status },
      include: { items: true },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Order update error:", error);
    return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
  }
}