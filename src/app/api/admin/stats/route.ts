import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/stats
export async function GET() {
  try {
    await requireAdmin();

    const [totalProducts, totalOrders, totalRevenue, totalUsers, recentOrders, ordersByStatus, categoryBreakdown] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.order.aggregate({ _sum: { total: true } }),
      db.user.count(),
      db.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { items: { select: { name: true, quantity: true, price: true } } },
      }),
      db.order.groupBy({
        by: ["status"],
        _count: true,
      }),
      db.product.groupBy({
        by: ["category"],
        _count: true,
        _avg: { price: true },
      }),
    ]);

    // Revenue by month (last 6 months) - single query with date range
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyOrders = await db.order.findMany({
      where: {
        createdAt: { gte: sixMonthsAgo },
        status: { not: "cancelled" },
      },
      select: { total: true, createdAt: true },
    });

    // Group by month
    const revenueMap = new Map<string, number>();
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const label = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
      revenueMap.set(key, 0);
      revenueMap.set(`${key}-label`, label as unknown as number);
    }

    for (const order of monthlyOrders) {
      const d = new Date(order.createdAt);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      revenueMap.set(key, (revenueMap.get(key) || 0) + order.total);
    }

    const revenueByMonth = Array.from(revenueMap.entries())
      .filter(([k]) => !k.endsWith("-label"))
      .map(([key, revenue]) => ({
        month: revenueMap.get(`${key}-label`) as unknown as string || "",
        revenue,
      }));

    return NextResponse.json({
      totalProducts,
      totalOrders,
      totalUsers,
      totalRevenue: totalRevenue._sum.total || 0,
      recentOrders,
      ordersByStatus: ordersByStatus.map((s) => ({ status: s.status, count: s._count })),
      categoryBreakdown: categoryBreakdown.map((c) => ({
        category: c.category,
        count: c._count,
        avgPrice: c._avg.price ? Math.round(c._avg.price * 100) / 100 : 0,
      })),
      revenueByMonth,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (message === "Forbidden") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}
