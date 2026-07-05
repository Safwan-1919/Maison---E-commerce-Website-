import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get("orderNumber");

    if (!orderNumber) {
      return NextResponse.json({ error: "Order number is required" }, { status: 400 });
    }

    const order = await db.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if requester is the order owner or an admin
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
    const isOwner = token && token.id === order.userId;
    const isAdmin = token?.role === "admin";
    const isAuthenticated = !!token;

    // Generate tracking steps based on order status
    const statusSteps = ["pending", "confirmed", "shipped", "delivered"];
    const statusLabels: Record<string, string> = {
      pending: "Order Placed",
      confirmed: "Confirmed",
      shipped: "Shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };

    const orderDate = new Date(order.createdAt);
    const steps = statusSteps.map((status, index) => {
      const statusIndex = statusSteps.indexOf(order.status);
      const isCompleted = index < statusIndex || (order.status === "delivered" && index === statusIndex);
      const isCurrent = index === statusIndex && order.status !== "delivered" && order.status !== "cancelled";

      const stepDate = new Date(orderDate);
      stepDate.setHours(stepDate.getHours() + index * 24);

      return {
        label: statusLabels[status] || status,
        date: isCompleted || isCurrent ? stepDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "",
        time: isCompleted || isCurrent ? stepDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }) : "",
        description: isCompleted
          ? `Order ${statusLabels[status]?.toLowerCase() || status}`
          : isCurrent
          ? `Your order is currently ${order.status}`
          : `Expected ${statusLabels[status]?.toLowerCase() || status}`,
        completed: isCompleted,
        current: isCurrent,
      };
    });

    if (order.status === "cancelled") {
      steps.forEach((step, index) => {
        if (index > 1) {
          step.completed = false;
          step.current = false;
        }
      });
    }

    // Only return sensitive data to order owner or admin
    const canSeeSensitive = isOwner || isAdmin;

    return NextResponse.json({
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        status: order.status,
        total: canSeeSensitive ? order.total : null,
        subtotal: canSeeSensitive ? order.subtotal : null,
        discount: canSeeSensitive ? order.discount : null,
        shipping: canSeeSensitive ? order.shipping : null,
        paymentMethod: canSeeSensitive ? order.paymentMethod : null,
        paymentStatus: canSeeSensitive ? order.paymentStatus : null,
        shippingAddress: canSeeSensitive && order.shippingAddress ? JSON.parse(order.shippingAddress) : null,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          price: canSeeSensitive ? item.price : null,
          quantity: item.quantity,
          size: item.size,
          color: item.color,
          image: item.image,
        })),
      },
      trackingSteps: steps,
    });
  } catch (error) {
    console.error("Order tracking error:", error);
    return NextResponse.json({ error: "Failed to fetch order" }, { status: 500 });
  }
}
