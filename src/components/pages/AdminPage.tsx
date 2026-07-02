"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  TrendingUp, TrendingDown, DollarSign, Eye, ArrowUpRight,
  ArrowLeft, ChevronRight, Star, AlertCircle
} from "lucide-react";
import Image from "next/image";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid
} from "recharts";

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  conversionRate: number;
  avgOrderValue: number;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  items: { name: string; quantity: number }[];
}

interface TopProduct {
  id: string;
  name: string;
  price: number;
  reviewCount: number;
  stock: number;
}

interface CategoryData {
  category: string;
  _count: number;
  _avg: { price: number } | null;
}

const statusColors: Record<string, string> = {
  confirmed: "bg-[#4D5B47] text-[#F8F8F6]",
  shipped: "bg-[#B79B7B] text-[#F8F8F6]",
  delivered: "bg-[#111] text-[#F8F8F6]",
  cancelled: "bg-[#C53030] text-[#F8F8F6]",
  pending: "bg-[#F0EFED] text-[#666]",
};

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
];

function StatCard({ title, value, trend, prefix = "" }: {
  title: string; value: string | number; trend?: { value: number; positive: boolean }; prefix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E8E8E8] p-5"
    >
      <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">{title}</p>
      <div className="flex items-end justify-between">
        <p className="text-[24px] font-medium tracking-tight">
          {prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value}
        </p>
        {trend && (
          <div className={`flex items-center gap-0.5 text-[12px] ${trend.positive ? "text-[#4D5B47]" : "text-[#C53030]"}`}>
            {trend.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}%
          </div>
        )}
      </div>
    </motion.div>
  );
}

function ComingSoon() {
  return (
    <div className="flex-1 flex items-center justify-center py-24">
      <div className="text-center">
        <AlertCircle className="w-12 h-12 text-[#D1D1D1] mx-auto mb-4" strokeWidth={1} />
        <h3 className="text-[18px] font-medium text-[#111] mb-1">Coming Soon</h3>
        <p className="text-[13px] text-[#999]">This section is under development</p>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-[#E8E8E8] px-3 py-2 shadow-sm">
        <p className="text-[11px] text-[#999] mb-0.5">{label}</p>
        <p className="text-[13px] font-medium">{"\u20B9"}{payload[0].value.toLocaleString("en-IN")}</p>
      </div>
    );
  }
  return null;
};

export default function AdminPage() {
  const { navigate } = useStore();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number }[]>([]);
  const [categoryData, setCategoryData] = useState<CategoryData[]>([]);
  const [ordersByStatus, setOrdersByStatus] = useState<{ status: string; _count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => r.json())
      .then((data) => {
        setStats(data.stats);
        setOrders(data.recentOrders || []);
        setTopProducts(data.topProducts || []);
        setRevenueData(data.revenueByMonth || []);
        setCategoryData(data.categoryBreakdown || []);
        setOrdersByStatus(data.ordersByStatus || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[#F8F8F6] pt-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Store
        </button>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">Admin Dashboard</h1>
            <p className="text-[14px] text-[#999] mt-1">Overview of your store performance</p>
          </div>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden w-10 h-10 border border-[#E8E8E8] flex items-center justify-center"
          >
            <LayoutDashboard className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            w-[240px] bg-[#F8F8F6] lg:bg-transparent
            border-r border-[#E8E8E8] lg:border-0
            p-5 lg:p-0
            pt-16 lg:pt-0
            transform transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          `}>
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActiveSection(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors ${
                    activeSection === item.id
                      ? "bg-[#111] text-[#F8F8F6] font-medium"
                      : "text-[#666] hover:text-[#111] hover:bg-[#F0EFED]"
                  }`}
                >
                  <item.icon className="w-4 h-4" strokeWidth={1.5} />
                  {item.label}
                </button>
              ))}
            </nav>
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black/20 z-[-1] lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {activeSection === "dashboard" && (
              <>
                {loading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-28 skeleton-shimmer rounded-[4px]" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Stats */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <StatCard
                        title="Total Revenue"
                        value={Math.round(stats?.totalRevenue || 0)}
                        prefix={"\u20B9"}
                        trend={{ value: 12.5, positive: true }}
                      />
                      <StatCard
                        title="Total Orders"
                        value={stats?.totalOrders || 0}
                        trend={{ value: 8.2, positive: true }}
                      />
                      <StatCard
                        title="Conversion Rate"
                        value={`${stats?.conversionRate || 0}%`}
                        trend={{ value: 2.1, positive: true }}
                      />
                      <StatCard
                        title="Avg. Order Value"
                        value={Math.round(stats?.avgOrderValue || 0)}
                        prefix={"\u20B9"}
                        trend={{ value: 3.4, positive: false }}
                      />
                    </div>

                    {/* Charts */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                      {/* Revenue Chart */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-[14px] font-medium">Revenue Overview</h3>
                          <span className="text-[11px] text-[#999] tracking-wide">Last 6 months</span>
                        </div>
                        <div className="h-[240px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <defs>
                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#4D5B47" stopOpacity={0.15} />
                                  <stop offset="95%" stopColor="#4D5B47" stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#999" }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#999" }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                              <Tooltip content={<CustomTooltip />} />
                              <Area type="monotone" dataKey="revenue" stroke="#4D5B47" strokeWidth={2} fill="url(#colorRevenue)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>

                      {/* Orders by Status */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-[14px] font-medium">Orders by Status</h3>
                          <span className="text-[11px] text-[#999] tracking-wide">All time</span>
                        </div>
                        <div className="h-[240px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={ordersByStatus} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F0EFED" vertical={false} />
                              <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#999" }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#999" }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="_count" fill="#111" radius={[2, 2, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    </div>

                    {/* Recent Orders Table */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white border border-[#E8E8E8] mb-8 overflow-hidden"
                    >
                      <div className="p-5 border-b border-[#E8E8E8] flex items-center justify-between">
                        <h3 className="text-[14px] font-medium">Recent Orders</h3>
                        <button className="text-[11px] text-[#4D5B47] hover:text-[#111] transition-colors tracking-wide uppercase flex items-center gap-1">
                          View All <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                          <thead>
                            <tr className="border-b border-[#E8E8E8]">
                              <th className="text-left py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Order</th>
                              <th className="text-left py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Date</th>
                              <th className="text-left py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Items</th>
                              <th className="text-right py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Total</th>
                              <th className="text-center py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Status</th>
                              <th className="text-center py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Payment</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orders.slice(0, 8).map((order) => (
                              <tr key={order.id} className="border-b border-[#F0EFED] hover:bg-[#FAFAF8] transition-colors">
                                <td className="py-3 px-5 font-medium text-[#111]">#{order.orderNumber.slice(-6)}</td>
                                <td className="py-3 px-5 text-[#666]">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                                </td>
                                <td className="py-3 px-5 text-[#666]">{order.items?.length || 0} items</td>
                                <td className="py-3 px-5 text-right font-medium">{"\u20B9"}{Math.round(order.total).toLocaleString("en-IN")}</td>
                                <td className="py-3 px-5 text-center">
                                  <span className={`inline-block px-2.5 py-1 text-[10px] font-medium tracking-wide uppercase ${statusColors[order.status] || statusColors.pending}`}>
                                    {order.status}
                                  </span>
                                </td>
                                <td className="py-3 px-5 text-center">
                                  <span className={`text-[11px] ${order.paymentStatus === "completed" ? "text-[#4D5B47] font-medium" : "text-[#999]"}`}>
                                    {order.paymentStatus === "completed" ? "Paid" : order.paymentStatus}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>

                    {/* Bottom Row */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Top Products */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <h3 className="text-[14px] font-medium mb-4">Top Products</h3>
                        <div className="space-y-4">
                          {topProducts.slice(0, 5).map((product, i) => (
                            <div key={product.id} className="flex items-center gap-3">
                              <span className="text-[12px] text-[#999] w-4">{i + 1}.</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-[13px] text-[#111] line-clamp-1">{product.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[12px] font-medium">{"\u20B9"}{product.price.toLocaleString("en-IN")}</span>
                                  <span className="text-[11px] text-[#999]">
                                    <Star className="w-2.5 h-2.5 inline fill-[#111] text-[#111]" /> {product.reviewCount}
                                  </span>
                                </div>
                                {/* Stock bar */}
                                <div className="mt-1.5 h-1 bg-[#F0EFED] w-full max-w-[120px]">
                                  <div
                                    className={`h-full transition-all ${
                                      product.stock < 30 ? "bg-[#C53030]" : product.stock < 60 ? "bg-[#B79B7B]" : "bg-[#4D5B47]"
                                    }`}
                                    style={{ width: `${Math.min((product.stock / 150) * 100, 100)}%` }}
                                  />
                                </div>
                              </div>
                              <span className={`text-[11px] font-medium ${
                                product.stock < 30 ? "text-[#C53030]" : "text-[#999]"
                              }`}>
                                {product.stock} left
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>

                      {/* Category Breakdown */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <h3 className="text-[14px] font-medium mb-4">Category Breakdown</h3>
                        <div className="space-y-3">
                          {categoryData.map((cat) => (
                            <div key={cat.category} className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-3">
                                <span className="text-[13px] text-[#111]">{cat.category}</span>
                                <span className="text-[11px] text-[#999]">{cat._count} products</span>
                              </div>
                              <span className="text-[12px] text-[#666] font-medium">
                                Avg. {"\u20B9"}{Math.round(cat._avg?.price || 0).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    </div>
                  </>
                )}
              </>
            )}

            {activeSection !== "dashboard" && <ComingSoon />}
          </div>
        </div>
      </div>
    </main>
  );
}