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
  BarChart, Bar, CartesianGrid, PieChart, Pie, Cell
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
}

const statusColors: Record<string, string> = {
  confirmed: "bg-[#4D5B47] text-[#F8F8F6]",
  shipped: "bg-[#B79B7B] text-[#F8F8F6]",
  delivered: "bg-[#111] text-[#F8F8F6]",
  cancelled: "bg-[#C53030] text-[#F8F8F6]",
  pending: "bg-[#F0EFED] text-[#666]",
};

const PIE_COLORS = ["#4D5B47", "#B79B7B", "#111", "#C53030", "#E8E8E8"];

const PIE_LABEL_COLORS: Record<string, string> = {
  confirmed: "bg-[#4D5B47]",
  shipped: "bg-[#B79B7B]",
  delivered: "bg-[#111]",
  cancelled: "bg-[#C53030]",
  pending: "bg-[#E8E8E8]",
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

  // Products tab state
  const [productList, setProductList] = useState<ProductItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [productsFetched, setProductsFetched] = useState(false);
  const productsLoading = activeSection === "products" && !productsFetched;

  // Orders tab state
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState("all");
  const [ordersFetched, setOrdersFetched] = useState(false);
  const ordersLoading = activeSection === "orders" && !ordersFetched;

  // Analytics tab state
  const [analyticsStats, setAnalyticsStats] = useState<AdminStats | null>(null);
  const [analyticsOrdersByStatus, setAnalyticsOrdersByStatus] = useState<{ status: string; _count: number }[]>([]);
  const [analyticsCategoryData, setAnalyticsCategoryData] = useState<CategoryData[]>([]);
  const [analyticsStockValue, setAnalyticsStockValue] = useState(0);
  const [analyticsFetched, setAnalyticsFetched] = useState(false);
  const analyticsLoading = activeSection === "analytics" && !analyticsFetched;

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

  // Fetch products for Products tab
  useEffect(() => {
    if (activeSection === "products" && !productsFetched) {
      fetch("/api/products?limit=50")
        .then((r) => r.json())
        .then((data) => {
          setProductList(data.products || []);
          setProductsFetched(true);
        })
        .catch(() => setProductsFetched(true));
    }
  }, [activeSection, productsFetched]);

  // Fetch orders for Orders tab
  useEffect(() => {
    if (activeSection === "orders" && !ordersFetched) {
      fetch("/api/orders?limit=50")
        .then((r) => r.json())
        .then((data) => {
          setAllOrders(data.orders || []);
          setOrdersFetched(true);
        })
        .catch(() => setOrdersFetched(true));
    }
  }, [activeSection, ordersFetched]);

  // Fetch data for Analytics tab
  useEffect(() => {
    if (activeSection === "analytics" && !analyticsFetched) {
      Promise.all([
        fetch("/api/admin").then((r) => r.json()),
        fetch("/api/products?limit=100").then((r) => r.json()),
      ])
        .then(([adminData, productsData]) => {
          setAnalyticsStats(adminData.stats);
          setAnalyticsOrdersByStatus(adminData.ordersByStatus || []);
          setAnalyticsCategoryData(adminData.categoryBreakdown || []);
          const sv = (productsData.products || []).reduce(
            (sum: number, p: ProductItem) => sum + p.price * p.stock,
            0
          );
          setAnalyticsStockValue(sv);
          setAnalyticsFetched(true);
        })
        .catch(() => setAnalyticsFetched(true));
    }
  }, [activeSection, analyticsFetched]);

  // Computed values
  const filteredProducts = productList.filter((p) =>
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders =
    orderStatusFilter === "all"
      ? allOrders
      : allOrders.filter((o) => o.status === orderStatusFilter);

  const categoryRevenueData = analyticsCategoryData.map((cat) => ({
    name: cat.category,
    revenue: Math.round((cat._avg?.price || 0) * cat._count),
  }));

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

            {activeSection === "products" && (
              <>
                {productsLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-16 skeleton-shimmer rounded-[4px]" />
                    ))}
                  </div>
                ) : (
                  <>
                    {/* Search Bar */}
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-6"
                    >
                      <input
                        type="text"
                        placeholder="Search products by name..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full sm:w-80 border border-[#E8E8E8] bg-white px-4 py-2.5 text-[13px] outline-none focus:border-[#111] transition-colors placeholder:text-[#999]"
                      />
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
                          <span className="text-[#999] font-normal ml-2">({filteredProducts.length})</span>
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
                                    <Image
                                      src={product.images?.split(",")[0] || "/placeholder.jpg"}
                                      alt={product.name}
                                      fill
                                      className="object-cover"
                                      sizes="40px"
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
                                  {productSearch ? "No products match your search" : "No products found"}
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

            {activeSection === "orders" && (
              <>
                {ordersLoading ? (
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
                      {["all", "pending", "confirmed", "shipped", "delivered", "cancelled"].map((s) => {
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
                            </tr>
                          </thead>
                          <tbody>
                            {filteredOrders.map((order, idx) => (
                              <motion.tr
                                key={order.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.02 }}
                                className="border-b border-[#F0EFED] hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                                onClick={() => navigate("order-tracking")}
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
                              </motion.tr>
                            ))}
                            {filteredOrders.length === 0 && (
                              <tr>
                                <td colSpan={6} className="py-12 text-center text-[13px] text-[#999]">
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

            {activeSection === "analytics" && (
              <>
                {analyticsLoading ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="h-24 skeleton-shimmer rounded-[4px]" />
                    ))}
                  </div>
                ) : analyticsStats ? (
                  <>
                    {/* Key Metrics Grid */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">Total Revenue</p>
                            <p className="text-[24px] font-medium tracking-tight">{"\u20B9"}{Math.round(analyticsStats.totalRevenue).toLocaleString("en-IN")}</p>
                          </div>
                          <DollarSign className="w-5 h-5 text-[#999] mt-0.5" strokeWidth={1.5} />
                        </div>
                        <p className="text-[11px] text-[#999] mt-2">Total sales revenue across all orders</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">Total Orders</p>
                            <p className="text-[24px] font-medium tracking-tight">{analyticsStats.totalOrders.toLocaleString("en-IN")}</p>
                          </div>
                          <ShoppingCart className="w-5 h-5 text-[#999] mt-0.5" strokeWidth={1.5} />
                        </div>
                        <p className="text-[11px] text-[#999] mt-2">All placed orders to date</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">Products</p>
                            <p className="text-[24px] font-medium tracking-tight">{analyticsStats.totalProducts}</p>
                          </div>
                          <Package className="w-5 h-5 text-[#999] mt-0.5" strokeWidth={1.5} />
                        </div>
                        <p className="text-[11px] text-[#999] mt-2">Active products in catalog</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">Avg. Order Value</p>
                            <p className="text-[24px] font-medium tracking-tight">{"\u20B9"}{Math.round(analyticsStats.avgOrderValue).toLocaleString("en-IN")}</p>
                          </div>
                          <TrendingUp className="w-5 h-5 text-[#999] mt-0.5" strokeWidth={1.5} />
                        </div>
                        <p className="text-[11px] text-[#999] mt-2">Average revenue per order</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">Conversion Rate</p>
                            <p className="text-[24px] font-medium tracking-tight">{analyticsStats.conversionRate}%</p>
                          </div>
                          <BarChart3 className="w-5 h-5 text-[#999] mt-0.5" strokeWidth={1.5} />
                        </div>
                        <p className="text-[11px] text-[#999] mt-2">Visitor to buyer ratio</p>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">Stock Value</p>
                            <p className="text-[24px] font-medium tracking-tight">{"\u20B9"}{Math.round(analyticsStockValue).toLocaleString("en-IN")}</p>
                          </div>
                          <ArrowUpRight className="w-5 h-5 text-[#999] mt-0.5" strokeWidth={1.5} />
                        </div>
                        <p className="text-[11px] text-[#999] mt-2">Total inventory value at retail</p>
                      </motion.div>
                    </div>

                    {/* Charts Row */}
                    <div className="grid lg:grid-cols-2 gap-6 mb-8">
                      {/* Order Status Pie/Donut Chart */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-[14px] font-medium">Order Status Distribution</h3>
                          <span className="text-[11px] text-[#999] tracking-wide">All time</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="h-[220px] w-[220px] flex-shrink-0">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={analyticsOrdersByStatus}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={55}
                                  outerRadius={90}
                                  paddingAngle={3}
                                  dataKey="_count"
                                  nameKey="status"
                                  stroke="none"
                                >
                                  {analyticsOrdersByStatus.map((entry, index) => (
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
                            {analyticsOrdersByStatus.map((entry, index) => (
                              <div key={entry.status} className="flex items-center gap-2.5">
                                <div className={`w-2.5 h-2.5 ${PIE_LABEL_COLORS[entry.status] || "bg-[#E8E8E8]"}`} />
                                <span className="text-[12px] text-[#666] capitalize flex-1">{entry.status}</span>
                                <span className="text-[12px] font-medium text-[#111]">{entry._count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>

                      {/* Category Revenue Horizontal Bar Chart */}
                      <motion.div
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.35 }}
                        className="bg-white border border-[#E8E8E8] p-5"
                      >
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-[14px] font-medium">Category Revenue</h3>
                          <span className="text-[11px] text-[#999] tracking-wide">Estimated</span>
                        </div>
                        <div className="h-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={categoryRevenueData}
                              layout="vertical"
                              margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" stroke="#F0EFED" horizontal={false} />
                              <XAxis
                                type="number"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#999" }}
                                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                              />
                              <YAxis
                                type="category"
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 11, fill: "#666" }}
                                width={90}
                              />
                              <Tooltip
                                formatter={(value: number) => [`\u20B9${value.toLocaleString("en-IN")}`, "Revenue"]}
                                contentStyle={{
                                  border: "1px solid #E8E8E8",
                                  fontSize: "12px",
                                  borderRadius: "4px",
                                }}
                              />
                              <Bar dataKey="revenue" fill="#4D5B47" radius={[0, 2, 2, 0]} barSize={16} />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </motion.div>
                    </div>
                  </>
                ) : null}
              </>
            )}

            {activeSection === "users" && <ComingSoon />}
          </div>
        </div>
      </div>
    </main>
  );
}