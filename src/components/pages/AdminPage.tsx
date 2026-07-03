"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  TrendingUp, TrendingDown, DollarSign, Eye, ArrowUpRight,
  ArrowLeft, ChevronRight, Star, AlertCircle, Shield, Loader2, Search, Filter
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell
} from "recharts";

// ── Types ───────────────────────────────────────────────────────────────────
interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  recentOrders: Order[];
  ordersByStatus: { status: string; count: number }[];
  categoryBreakdown: { category: string; count: number; avgPrice: number }[];
  revenueByMonth: { month: string; revenue: number }[];
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  paymentStatus: string;
  createdAt: string;
  items: { name: string; quantity: number; price: number }[];
  userId?: string;
  user?: { name?: string; email?: string };
}

interface ProductItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  mrp: number;
  category: string;
  brand: string;
  stock: number;
  rating: number;
  reviewCount: number;
  images: string;
  _count?: { reviews: number; orderItems: number };
}

const statusColors: Record<string, string> = {
  confirmed: "bg-[#4D5B47] text-[#F8F8F6]",
  shipped: "bg-[#B79B7B] text-[#F8F8F6]",
  delivered: "bg-[#111] text-[#F8F8F6]",
  cancelled: "bg-[#C53030] text-[#F8F8F6]",
  pending: "bg-[#F0EFED] text-[#666]",
  processing: "bg-[#F0EFED] text-[#666]",
};

const PIE_COLORS = ["#4D5B47", "#B79B7B", "#111", "#C53030", "#E8E8E8", "#999"];
const PIE_LABEL_COLORS: Record<string, string> = {
  confirmed: "bg-[#4D5B47]",
  shipped: "bg-[#B79B7B]",
  delivered: "bg-[#111]",
  cancelled: "bg-[#C53030]",
  pending: "bg-[#E8E8E8]",
  processing: "bg-[#999]",
};

const sidebarItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
];

function StatCard({ title, value, prefix = "" }: {
  title: string; value: string | number; prefix?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E8E8E8] p-5"
    >
      <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">{title}</p>
      <p className="text-[24px] font-medium tracking-tight">
        {prefix}{typeof value === "number" ? value.toLocaleString("en-IN") : value}
      </p>
    </motion.div>
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

const ORDER_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];

export default function AdminPage() {
  const { navigate, showNotification, setAuthOpen } = useStore();
  const { isAuthenticated, isAdmin, isLoading: authLoading } = useAuth();
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Dashboard state
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Products tab state
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productSearch, setProductSearch] = useState("");
  const [productCategory, setProductCategory] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // Orders tab state
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Fetch dashboard stats
  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/stats");
      const data = await res.json();
      if (res.ok) {
        setStats(data);
        // Extract unique categories
        const cats = (data.categoryBreakdown || []).map((c: { category: string }) => c.category);
        setCategories(cats);
      } else {
        setStats(null);
      }
    } catch {
      setStats(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin) fetchStats();
  }, [isAuthenticated, isAdmin, fetchStats]);

  // Fetch products
  const fetchProducts = useCallback(async (search = "", category = "", page = 1) => {
    setProductsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (search) params.set("search", search);
      if (category) params.set("category", category);
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (res.ok) {
        setProductList(data.products || []);
        setProductTotal(data.total || 0);
        setProductTotalPages(data.totalPages || 1);
      }
    } catch {}
    setProductsLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin && activeSection === "products") {
      fetchProducts(productSearch, productCategory, productPage);
    }
  }, [activeSection, productSearch, productCategory, productPage, isAuthenticated, isAdmin, fetchProducts]);

  // Fetch all orders for orders tab
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/orders?limit=100");
      const data = await res.json();
      if (res.ok) {
        setAllOrders(data.orders || []);
      }
    } catch {}
    setOrdersLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated && isAdmin && activeSection === "orders") {
      fetchOrders();
    }
  }, [activeSection, isAuthenticated, isAdmin, fetchOrders]);

  // Computed values
  const filteredProducts = productList;
  const filteredOrders =
    orderStatusFilter === "all"
      ? allOrders
      : allOrders.filter((o) => o.status === orderStatusFilter);

  const categoryRevenueData = (stats?.categoryBreakdown || []).map((cat) => ({
    name: cat.category,
    revenue: Math.round(cat.avgPrice * cat.count),
  }));

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(`Order status updated to ${newStatus}`, "success");
        fetchOrders();
        fetchStats(); // Refresh dashboard stats
      } else {
        showNotification(data.error || "Failed to update order status", "error");
      }
    } catch {
      showNotification("Failed to update order status", "error");
    }
    setUpdatingOrderId(null);
  };

  // Auth guard
  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-20 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#999] animate-spin" />
      </main>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm mx-auto px-4"
        >
          <div className="w-20 h-20 bg-[#F0EFED] rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-[#999]" strokeWidth={1.5} />
          </div>
          <h2 className="text-[22px] font-medium tracking-[-0.02em] mb-2">Access Denied</h2>
          <p className="text-[14px] text-[#666] mb-8">
            {!isAuthenticated
              ? "Please sign in with an admin account to access the dashboard."
              : "You do not have admin privileges to access this page."}
          </p>
          {!isAuthenticated ? (
            <button
              onClick={() => setAuthOpen(true)}
              className="px-8 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors"
            >
              Sign In
            </button>
          ) : (
            <button
              onClick={() => navigate("home")}
              className="px-8 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors"
            >
              Back to Store
            </button>
          )}
        </motion.div>
      </main>
    );
  }

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
                ) : stats ? (
                  <>
                    {/* Stats */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                      <StatCard title="Total Revenue" value={Math.round(stats.totalRevenue)} prefix={"\u20B9"} />
                      <StatCard title="Total Orders" value={stats.totalOrders} />
                      <StatCard title="Total Users" value={stats.totalUsers} />
                      <StatCard title="Total Products" value={stats.totalProducts} />
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
                            <AreaChart data={stats.revenueByMonth} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
                            <BarChart data={stats.ordersByStatus} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#F0EFED" vertical={false} />
                              <XAxis dataKey="status" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#999" }} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#999" }} />
                              <Tooltip content={<CustomTooltip />} />
                              <Bar dataKey="count" fill="#111" radius={[2, 2, 0, 0]} />
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
                        <button
                          onClick={() => setActiveSection("orders")}
                          className="text-[11px] text-[#4D5B47] hover:text-[#111] transition-colors tracking-wide uppercase flex items-center gap-1"
                        >
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
                            {(stats.recentOrders || []).slice(0, 8).map((order) => (
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
                            {(stats.recentOrders || []).length === 0 && (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-[13px] text-[#999]">No orders yet</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>

                    {/* Bottom Row */}
                    <div className="grid lg:grid-cols-2 gap-6">
                      {/* Category Breakdown */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <h3 className="text-[14px] font-medium mb-4">Category Breakdown</h3>
                        <div className="space-y-3">
                          {(stats.categoryBreakdown || []).map((cat) => (
                            <div key={cat.category} className="flex items-center justify-between py-1.5">
                              <div className="flex items-center gap-3">
                                <span className="text-[13px] text-[#111]">{cat.category}</span>
                                <span className="text-[11px] text-[#999]">{cat.count} products</span>
                              </div>
                              <span className="text-[12px] text-[#666] font-medium">
                                Avg. {"\u20B9"}{Math.round(cat.avgPrice).toLocaleString("en-IN")}
                              </span>
                            </div>
                          ))}
                          {(stats.categoryBreakdown || []).length === 0 && (
                            <p className="text-[13px] text-[#999] py-4 text-center">No category data</p>
                          )}
                        </div>
                      </motion.div>

                      {/* Order Status Pie Chart */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <h3 className="text-[14px] font-medium mb-4">Order Status Distribution</h3>
                        {(stats.ordersByStatus || []).length > 0 ? (
                          <div className="flex items-center gap-6">
                            <div className="h-[200px] w-[200px] flex-shrink-0">
                              <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                  <Pie
                                    data={stats.ordersByStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="count"
                                    nameKey="status"
                                    stroke="none"
                                  >
                                    {(stats.ordersByStatus || []).map((entry, index) => (
                                      <Cell key={entry.status} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                  </Pie>
                                  <Tooltip
                                    formatter={(value: number) => [`${value} orders`, ""]}
                                    contentStyle={{
                                      border: "1px solid #E8E8E8",
                                      fontSize: "12px",
                                      borderRadius: "4px",
                                    }}
                                  />
                                </PieChart>
                              </ResponsiveContainer>
                            </div>
                            <div className="flex-1 space-y-2.5">
                              {(stats.ordersByStatus || []).map((entry, index) => (
                                <div key={entry.status} className="flex items-center gap-2.5">
                                  <div className={`w-2.5 h-2.5 ${PIE_LABEL_COLORS[entry.status] || "bg-[#E8E8E8]"}`} />
                                  <span className="text-[12px] text-[#666] capitalize flex-1">{entry.status}</span>
                                  <span className="text-[12px] font-medium text-[#111]">{entry.count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <p className="text-[13px] text-[#999] py-8 text-center">No order data yet</p>
                        )}
                      </motion.div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-12">
                    <AlertCircle className="w-10 h-10 text-[#D1D1D1] mx-auto mb-3" strokeWidth={1} />
                    <p className="text-[14px] text-[#666]">Failed to load dashboard data</p>
                    <button
                      onClick={fetchStats}
                      className="mt-3 text-[12px] text-[#4D5B47] uppercase tracking-wider hover:underline"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </>
            )}

            {activeSection === "products" && (
              <>
                {productsLoading && productList.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-16 skeleton-shimmer rounded-[4px]" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Search & Filter Bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 flex flex-col sm:flex-row gap-3"
                    >
                      <div className="relative flex-1 sm:max-w-xs">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" strokeWidth={1.5} />
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                          className="w-full border border-[#E8E8E8] bg-white pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-[#111] transition-colors placeholder:text-[#999]"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" strokeWidth={1.5} />
                        <select
                          value={productCategory}
                          onChange={(e) => { setProductCategory(e.target.value); setProductPage(1); }}
                          className="appearance-none border border-[#E8E8E8] bg-white pl-10 pr-8 py-2.5 text-[13px] outline-none focus:border-[#111] transition-colors text-[#666] cursor-pointer"
                        >
                          <option value="">All Categories</option>
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                    </motion.div>

                    {/* Products Table */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="bg-white border border-[#E8E8E8] overflow-hidden"
                    >
                      <div className="p-5 border-b border-[#E8E8E8] flex items-center justify-between">
                        <h3 className="text-[14px] font-medium">
                          All Products
                          <span className="text-[#999] font-normal ml-2">({productTotal})</span>
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                          <thead className="sticky top-0 bg-white z-10">
                            <tr className="border-b border-[#E8E8E8]">
                              <th className="text-left py-3 px-4 text-[11px] font-medium tracking-wider uppercase text-[#999]">Image</th>
                              <th className="text-left py-3 px-4 text-[11px] font-medium tracking-wider uppercase text-[#999]">Name</th>
                              <th className="text-left py-3 px-4 text-[11px] font-medium tracking-wider uppercase text-[#999]">Category</th>
                              <th className="text-left py-3 px-4 text-[11px] font-medium tracking-wider uppercase text-[#999]">Brand</th>
                              <th className="text-right py-3 px-4 text-[11px] font-medium tracking-wider uppercase text-[#999]">Price</th>
                              <th className="text-left py-3 px-4 text-[11px] font-medium tracking-wider uppercase text-[#999]">Stock</th>
                              <th className="text-center py-3 px-4 text-[11px] font-medium tracking-wider uppercase text-[#999]">Rating</th>
                              <th className="text-center py-3 px-4 text-[11px] font-medium tracking-wider uppercase text-[#999]">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map((product, idx) => (
                              <motion.tr
                                key={product.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="border-b border-[#F0EFED] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                                onClick={() => navigate("product", product.id)}
                              >
                                <td className="py-3 px-4">
                                  <div className="w-10 h-12 relative overflow-hidden bg-[#F0EFED]">
                                    <img
                                      src={product.images?.split(",").filter(Boolean)[0] || "/placeholder.jpg"}
                                      alt={product.name}
                                      className="w-10 h-12 object-cover rounded-[2px]"
                                    />
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-medium text-[#111] max-w-[200px]">
                                  <p className="line-clamp-1">{product.name}</p>
                                </td>
                                <td className="py-3 px-4 text-[#666]">{product.category}</td>
                                <td className="py-3 px-4 text-[#666]">{product.brand}</td>
                                <td className="py-3 px-4 text-right font-medium">{"\u20B9"}{Math.round(product.price).toLocaleString("en-IN")}</td>
                                <td className="py-3 px-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-16 h-1.5 bg-[#F0EFED]">
                                      <div
                                        className={`h-full transition-all ${
                                          product.stock < 30 ? "bg-[#C53030]" : product.stock < 60 ? "bg-[#B79B7B]" : "bg-[#4D5B47]"
                                        }`}
                                        style={{ width: `${Math.min((product.stock / 150) * 100, 100)}%` }}
                                      />
                                    </div>
                                    <span className="text-[11px] text-[#666]">{product.stock}</span>
                                  </div>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className="text-[11px] text-[#666]">
                                    <Star className="w-2.5 h-2.5 inline fill-[#111] text-[#111] mr-0.5" />
                                    {product.rating.toFixed(1)}
                                    <span className="text-[#999]"> ({product._count?.reviews || product.reviewCount})</span>
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-center">
                                  <span className={`inline-block px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${
                                    product.stock === 0
                                      ? "bg-[#C53030] text-[#F8F8F6]"
                                      : product.stock < 30
                                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                                        : "bg-[#4D5B47] text-[#F8F8F6]"
                                  }`}>
                                    {product.stock === 0 ? "Out of Stock" : product.stock < 30 ? "Low Stock" : "In Stock"}
                                  </span>
                                </td>
                              </motion.tr>
                            ))}
                            {filteredProducts.length === 0 && (
                              <tr>
                                <td colSpan={8} className="py-12 text-center text-[13px] text-[#999]">
                                  {productSearch || productCategory ? "No products match your filters" : "No products found"}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Product Pagination */}
                      {productTotalPages > 1 && (
                        <div className="flex items-center justify-center gap-2 p-4 border-t border-[#E8E8E8]">
                          <button
                            disabled={productPage <= 1}
                            onClick={() => setProductPage(productPage - 1)}
                            className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#666] border border-[#E8E8E8] hover:border-[#999] disabled:opacity-30 rounded-[4px]"
                          >
                            Prev
                          </button>
                          <span className="text-[11px] text-[#999]">Page {productPage} of {productTotalPages}</span>
                          <button
                            disabled={productPage >= productTotalPages}
                            onClick={() => setProductPage(productPage + 1)}
                            className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#666] border border-[#E8E8E8] hover:border-[#999] disabled:opacity-30 rounded-[4px]"
                          >
                            Next
                          </button>
                        </div>
                      )}
                    </motion.div>
                  </>
                )}
              </>
            )}

            {activeSection === "orders" && (
              <>
                {ordersLoading && allOrders.length === 0 ? (
                  <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-14 skeleton-shimmer rounded-[4px]" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Status Filter Buttons */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6 flex flex-wrap gap-2"
                    >
                      {["all", ...ORDER_STATUSES].map((s) => {
                        const count = s === "all" ? allOrders.length : allOrders.filter((o) => o.status === s).length;
                        return (
                          <button
                            key={s}
                            onClick={() => setOrderStatusFilter(s)}
                            className={`px-3 py-1.5 text-[11px] tracking-wide uppercase transition-colors border ${
                              orderStatusFilter === s
                                ? "bg-[#111] text-[#F8F8F6] border-[#111]"
                                : "bg-white text-[#666] border-[#E8E8E8] hover:text-[#111] hover:border-[#999]"
                            }`}
                          >
                            {s === "all" ? "All" : s} ({count})
                          </button>
                        );
                      })}
                    </motion.div>

                    {/* Orders Table */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 }}
                      className="bg-white border border-[#E8E8E8] overflow-hidden"
                    >
                      <div className="p-5 border-b border-[#E8E8E8] flex items-center justify-between">
                        <h3 className="text-[14px] font-medium">
                          {orderStatusFilter === "all" ? "All Orders" : `${orderStatusFilter.charAt(0).toUpperCase() + orderStatusFilter.slice(1)} Orders`}
                          <span className="text-[#999] font-normal ml-2">({filteredOrders.length})</span>
                        </h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[13px]">
                          <thead className="sticky top-0 bg-white z-10">
                            <tr className="border-b border-[#E8E8E8]">
                              <th className="text-left py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Order</th>
                              <th className="text-left py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Date</th>
                              <th className="text-left py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Items</th>
                              <th className="text-right py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Total</th>
                              <th className="text-center py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Status</th>
                              <th className="text-center py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Payment</th>
                              <th className="text-center py-3 px-5 text-[11px] font-medium tracking-wider uppercase text-[#999]">Update</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.map((order, idx) => (
                              <motion.tr
                                key={order.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="border-b border-[#F0EFED] hover:bg-[#FAFAF8] transition-colors"
                              >
                                <td className="py-3 px-5 font-medium text-[#111]">#{order.orderNumber.slice(-6)}</td>
                                <td className="py-3 px-5 text-[#666]">
                                  {new Date(order.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
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
                                <td className="py-3 px-5 text-center">
                                  {order.status !== "delivered" && order.status !== "cancelled" ? (
                                    <select
                                      value={order.status}
                                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                                      disabled={updatingOrderId === order.id}
                                      onClick={(e) => e.stopPropagation()}
                                      className="text-[11px] border border-[#E8E8E8] rounded-[4px] px-2 py-1 bg-white outline-none focus:border-[#111] cursor-pointer disabled:opacity-50"
                                    >
                                      {ORDER_STATUSES.map((s) => (
                                        <option key={s} value={s} className="capitalize">{s}</option>
                                      ))}
                                    </select>
                                  ) : (
                                    <span className="text-[11px] text-[#999]">—</span>
                                  )}
                                </td>
                              </motion.tr>
                            ))}
                            {filteredOrders.length === 0 && (
                              <tr>
                                <td colSpan={7} className="py-12 text-center text-[13px] text-[#999]">
                                  No orders found for this filter
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}