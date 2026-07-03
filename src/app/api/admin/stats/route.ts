import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

// GET /api/admin/stats
// Rate limiting should be applied via middleware in production
export async function GET() {
  try {
    await requireAdmin();

    const [totalProducts, totalOrders, totalRevenue, totalUsers] = await Promise.all([
      db.product.count(),
      db.order.count(),
      db.order.aggregate({ _sum: { total: true } }),
      db.user.count(),
    ]);

    const recentOrders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: { items: true },
    });

    const ordersByStatus = await db.order.groupBy({
      by: ["status"],
      _count: true,
    });

    const categoryBreakdown = await db.product.groupBy({
      by: ["category"],
      _count: true,
      _avg: { price: true },
    });

    // Revenue by month (last 6 months)
    const revenueByMonth: { month: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
      const monthStr = date.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

      const monthRevenue = await db.order.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { not: "cancelled" },
        },
        _sum: { total: true },
      });

      revenueByMonth.push({
        month: monthStr,
        revenue: monthRevenue._sum.total || 0,
      });
    }

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
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }
    if (error.message === "Forbidden") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Failed to fetch admin stats" }, { status: 500 });
  }
}