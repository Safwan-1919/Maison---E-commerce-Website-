import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";
import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().min(1),
  size: z.string().optional(),
  color: z.string().optional(),
  image: z.string().optional(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: z.record(z.string(), z.any()).optional(),
  paymentMethod: z.string().min(1, "Payment method is required"),
  couponCode: z.string().optional(),
});

// GET /api/orders?status=pending&page=1&limit=10
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { userId: user.id };
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      db.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { items: true },
      }),
      db.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Orders fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch orders" }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const contentType = request.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      return NextResponse.json({ success: false, error: "Content-Type must be application/json" }, { status: 400 });
    }

    const body = await request.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { items, shippingAddress, paymentMethod, couponCode } = parsed.data;

    // Use transaction for: price verification + stock check + coupon + order creation + stock decrement
    const order = await db.$transaction(async (tx) => {
      // 1. Verify prices from DB — never trust client-supplied prices
      let subtotal = 0;
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { price: true, mrp: true, stock: true, name: true },
        });
        if (!product) {
          throw new Error(`Product not found: ${item.name}`);
        }
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${item.name}. Available: ${product.stock}, Requested: ${item.quantity}`);
        }
        // Override client price with DB price
        item.price = product.price;
        subtotal += product.price * item.quantity;
      }

      // 2. Validate and apply coupon (inside transaction to prevent race condition)
      let discount = 0;
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({
          where: { code: couponCode.toUpperCase() },
        });

        if (!coupon || !coupon.isActive) {
          throw new Error("Invalid or inactive coupon code");
        }
        if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
          throw new Error("Coupon has expired");
        }
        if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
          throw new Error("Coupon has reached its usage limit");
        }
        if (coupon.minOrder && subtotal < coupon.minOrder) {
          throw new Error(`Minimum order amount of ₹${coupon.minOrder} required for this coupon`);
        }

        if (coupon.type === "percentage") {
          discount = (subtotal * coupon.discount) / 100;
        } else {
          discount = coupon.discount;
        }

        // Increment coupon usage atomically inside transaction
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usedCount: { increment: 1 } },
        });
      }

      const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
      const total = Math.max(0, subtotal - discount + shipping);

      // Generate unique order number with retry
      const now = new Date();
      const year = now.getFullYear();
      let orderNumber = "";
      let attempts = 0;
      do {
        const random = Math.floor(Math.random() * 1000000).toString().padStart(6, "0");
        orderNumber = `MSN-${year}-${random}`;
        const existing = await tx.order.findUnique({ where: { orderNumber } });
        if (!existing) break;
        attempts++;
      } while (attempts < 10);

      if (attempts >= 10) {
        throw new Error("Failed to generate unique order number");
      }

      // Create order with items (using DB-verified prices)
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          userId: user.id,
          total,
          subtotal,
          discount,
          shipping,
          shippingAddress: shippingAddress ? JSON.stringify(shippingAddress) : null,
          paymentMethod,
          paymentStatus: paymentMethod === "cod" ? "pending" : "completed",
          couponCode: couponCode ? couponCode.toUpperCase() : null,
          status: "confirmed",
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              size: item.size,
              color: item.color,
              image: item.image,
            })),
          },
        },
        include: { items: true },
      });

      // Decrement stock atomically
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return newOrder;
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      },
    }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (message.includes("Insufficient stock") || message.includes("not found")) {
      return NextResponse.json({ success: false, error: message }, { status: 400 });
    }
    console.error("Order creation error:", error);
    return NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
  }
}