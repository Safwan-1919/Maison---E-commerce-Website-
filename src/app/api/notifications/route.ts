import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

// GET /api/notifications - Returns notifications derived from user's orders
export async function GET() {
  try {
    const user = await requireAuth();

    const orders = await db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        createdAt: true,
        total: true,
      },
    });

    const notifications = orders.map((order) => {
      let title = "";
      let message = "";
      let type = "order";

      switch (order.status) {
        case "confirmed":
          title = "Order Confirmed";
          message = `Your order ${order.orderNumber} has been confirmed and is being prepared.`;
          break;
        case "shipped":
          title = "Order Shipped";
          message = `Great news! Your order ${order.orderNumber} has been shipped.`;
          break;
        case "delivered":
          title = "Order Delivered";
          message = `Your order ${order.orderNumber} has been delivered. We hope you love it!`;
          break;
        case "cancelled":
          title = "Order Cancelled";
          message = `Your order ${order.orderNumber} has been cancelled.`;
          break;
        default:
          title = "Order Update";
          message = `Your order ${order.orderNumber} status has been updated to ${order.status}.`;
      }

      return {
        id: order.id,
        title,
        message,
        type,
        time: order.createdAt,
        read: order.status === "delivered",
        orderNumber: order.orderNumber,
      };
    });

    // Add welcome notification if user has no orders
    if (notifications.length === 0) {
      notifications.push({
        id: "welcome",
        title: `Welcome to MAISON`,
        message: "Thank you for creating your account. Explore our latest collection.",
        type: "system",
        time: new Date().toISOString(),
        read: false,
        orderNumber: null,
      });
    }

    return NextResponse.json({ notifications });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    console.error("Notifications fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}
