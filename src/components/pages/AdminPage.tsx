"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  LayoutDashboard, Package, ShoppingCart, Users, BarChart3,
  TrendingUp, TrendingDown, DollarSign, Eye, ArrowUpRight,
  ArrowLeft, ChevronRight, Star, AlertCircle, Shield, Loader2, Search, Filter,
  Settings, Tag
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
  { id: "categories", label: "Categories", icon: Tag },
  { id: "coupons", label: "Coupons", icon: Tag },
  { id: "site-content", label: "Site Content", icon: Settings },
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

// ── Coupons Section ─────────────────────────────────────────────────────────

interface CouponItem {
  id: string;
  code: string;
  discount: number;
  type: string;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
}

function CouponSection() {
  const { showNotification } = useStore();
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<CouponItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percentage", discount: "", minOrder: "", maxUses: "", expiresAt: "", isActive: true });

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/coupons");
      const data = await res.json();
      if (res.ok) setCoupons(data.coupons || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchCoupons(); }, [fetchCoupons]);

  const resetForm = () => {
    setForm({ code: "", type: "percentage", discount: "", minOrder: "", maxUses: "", expiresAt: "", isActive: true });
    setEditing(null);
    setShowForm(false);
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.discount) {
      showNotification("Code and discount are required", "error");
      return;
    }
    setSaving(true);
    try {
      const body = editing ? { id: editing.id, ...form } : { ...form };
      const res = await fetch("/api/coupons", {
        method: editing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      showNotification(editing ? "Coupon updated" : "Coupon created", "success");
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      showNotification(err.message || "Failed to save coupon", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      const res = await fetch(`/api/coupons?id=${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed");
      showNotification("Coupon deleted", "success");
      fetchCoupons();
    } catch {
      showNotification("Failed to delete coupon", "error");
    }
  };

  const handleToggleActive = async (coupon: CouponItem) => {
    try {
      const res = await fetch("/api/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: coupon.id, isActive: !coupon.isActive }),
      });
      if (!res.ok) throw new Error("Failed");
      showNotification(`Coupon ${coupon.isActive ? "deactivated" : "activated"}`, "success");
      fetchCoupons();
    } catch {
      showNotification("Failed to update coupon", "error");
    }
  };

  const startEdit = (coupon: CouponItem) => {
    setForm({
      code: coupon.code,
      type: coupon.type,
      discount: String(coupon.discount),
      minOrder: coupon.minOrder ? String(coupon.minOrder) : "",
      maxUses: coupon.maxUses ? String(coupon.maxUses) : "",
      expiresAt: coupon.expiresAt ? new Date(coupon.expiresAt).toISOString().split("T")[0] : "",
      isActive: coupon.isActive,
    });
    setEditing(coupon);
    setShowForm(true);
  };

  const isExpired = (c: CouponItem) => c.expiresAt && new Date(c.expiresAt) < new Date();
  const isMaxedOut = (c: CouponItem) => c.maxUses !== null && c.usedCount >= c.maxUses;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[20px] font-medium">Coupons</h2>
        <button suppressHydrationWarning
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 bg-[#111] text-[#F8F8F6] text-[11px] tracking-widest uppercase hover:bg-[#333] transition-colors"
        >
          + Add Coupon
        </button>
      </div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white border border-[#E8E8E8] p-5 mb-6">
          <h3 className="text-[14px] font-medium mb-4">{editing ? "Edit Coupon" : "New Coupon"}</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-[11px] text-[#999] uppercase tracking-wider block mb-1">Code *</label>
              <input suppressHydrationWarning type="text" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#111] rounded-[4px]" placeholder="e.g. SAVE20" />
            </div>
            <div>
              <label className="text-[11px] text-[#999] uppercase tracking-wider block mb-1">Type *</label>
              <select suppressHydrationWarning value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#111] rounded-[4px]">
                <option value="percentage">Percentage (%)</option>
                <option value="flat">Flat (₹)</option>
              </select>
            </div>
            <div>
              <label className="text-[11px] text-[#999] uppercase tracking-wider block mb-1">Discount *</label>
              <input suppressHydrationWarning type="number" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#111] rounded-[4px]" placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 500"} />
            </div>
            <div>
              <label className="text-[11px] text-[#999] uppercase tracking-wider block mb-1">Min Order (₹)</label>
              <input suppressHydrationWarning type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#111] rounded-[4px]" placeholder="e.g. 1500" />
            </div>
            <div>
              <label className="text-[11px] text-[#999] uppercase tracking-wider block mb-1">Max Uses</label>
              <input suppressHydrationWarning type="number" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#111] rounded-[4px]" placeholder="Unlimited" />
            </div>
            <div>
              <label className="text-[11px] text-[#999] uppercase tracking-wider block mb-1">Expires At</label>
              <input suppressHydrationWarning type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#111] rounded-[4px]" />
            </div>
            <div>
              <label className="text-[11px] text-[#999] uppercase tracking-wider block mb-1">Active</label>
              <select suppressHydrationWarning value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}
                className="w-full px-3 py-2 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#111] rounded-[4px]">
                <option value="true">Yes</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button suppressHydrationWarning onClick={handleSave} disabled={saving}
              className="px-5 py-2 bg-[#111] text-[#F8F8F6] text-[11px] tracking-widest uppercase hover:bg-[#333] transition-colors disabled:opacity-50">
              {saving ? "Saving..." : editing ? "Update" : "Create"}
            </button>
            <button suppressHydrationWarning onClick={resetForm}
              className="px-5 py-2 border border-[#E8E8E8] text-[11px] tracking-widest uppercase hover:bg-[#F0EFED] transition-colors">
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      <div className="bg-white border border-[#E8E8E8] overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-[#E8E8E8]">
              <th className="py-3 px-5 text-[11px] font-medium tracking-widest uppercase text-[#999]">Code</th>
              <th className="py-3 px-5 text-[11px] font-medium tracking-widest uppercase text-[#999]">Discount</th>
              <th className="py-3 px-5 text-[11px] font-medium tracking-widest uppercase text-[#999]">Min Order</th>
              <th className="py-3 px-5 text-[11px] font-medium tracking-widest uppercase text-[#999]">Usage</th>
              <th className="py-3 px-5 text-[11px] font-medium tracking-widest uppercase text-[#999]">Expires</th>
              <th className="py-3 px-5 text-[11px] font-medium tracking-widest uppercase text-[#999]">Status</th>
              <th className="py-3 px-5 text-[11px] font-medium tracking-widest uppercase text-[#999]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-[13px] text-[#999]">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-[13px] text-[#999]">No coupons yet</td></tr>
            ) : (
              coupons.map((c) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="border-b border-[#F0EFED] hover:bg-[#FAFAF8]">
                  <td className="py-3 px-5">
                    <span className="text-[13px] font-medium tracking-wider">{c.code}</span>
                  </td>
                  <td className="py-3 px-5">
                    <span className="text-[13px]">{c.type === "percentage" ? `${c.discount}%` : `₹${c.discount.toLocaleString()}`}</span>
                  </td>
                  <td className="py-3 px-5 text-[13px] text-[#666]">{c.minOrder ? `₹${c.minOrder.toLocaleString()}` : "—"}</td>
                  <td className="py-3 px-5">
                    <span className="text-[13px]">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</span>
                  </td>
                  <td className="py-3 px-5 text-[13px] text-[#666]">
                    {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Never"}
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-2">
                      <span suppressHydrationWarning className={`px-2 py-0.5 text-[11px] rounded-[4px] ${
                        isExpired(c) ? "bg-[#FEE2E2] text-[#C53030]" :
                        isMaxedOut(c) ? "bg-[#F0EFED] text-[#666]" :
                        c.isActive ? "bg-[#4D5B47]/10 text-[#4D5B47]" :
                        "bg-[#F0EFED] text-[#999]"
                      }`}>
                        {isExpired(c) ? "Expired" : isMaxedOut(c) ? "Limit Reached" : c.isActive ? "Active" : "Inactive"}
                      </span>
                      <button suppressHydrationWarning onClick={() => handleToggleActive(c)}
                        className={`w-8 h-4 rounded-full transition-colors relative ${c.isActive ? "bg-[#4D5B47]" : "bg-[#E8E8E8]"}`}>
                        <div className={`w-3.5 h-3.5 bg-white rounded-full absolute top-0.5 transition-transform ${c.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex gap-2">
                      <button suppressHydrationWarning onClick={() => startEdit(c)} className="text-[11px] text-[#666] hover:text-[#111] underline">Edit</button>
                      <button suppressHydrationWarning onClick={() => handleDelete(c.id, c.code)} className="text-[11px] text-[#C53030] hover:text-[#9B1C1C] underline">Delete</button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}

// ── Categories Section ──────────────────────────────────────────────────────
function CategoriesSection() {
  const { showNotification } = useStore();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories?withCounts=true");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const handleImageUpdate = async (cat: any, newImage: string) => {
    setSaving(cat.id);
    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: cat.id, image: newImage }),
      });
      if (!res.ok) throw new Error("Failed");
      showNotification(`${cat.name} image updated`, "success");
      fetchCategories();
    } catch {
      showNotification("Failed to update category image", "error");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h2 className="text-[20px] font-medium mb-6">Manage Categories</h2>
      <p className="text-[13px] text-[#999] mb-6">Update category images displayed on the homepage. Paste an image URL below.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="border border-[#E8E8E8] bg-white p-4">
            <div className="aspect-[4/5] relative overflow-hidden mb-3 bg-[#F0EFED]">
              {cat.image ? (
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#999] text-[13px]">No image</div>
              )}
              {saving === cat.id && (
                <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#4D5B47]" />
                </div>
              )}
            </div>
            <h4 className="text-[14px] font-medium mb-1">{cat.name}</h4>
            <p className="text-[11px] text-[#999] mb-3">{cat.productCount} products</p>
            <div className="flex gap-2">
              <input suppressHydrationWarning
                type="text"
                defaultValue={cat.image || ""}
                placeholder="/images/category/name.png"
                onBlur={(e) => {
                  const val = e.target.value.trim();
                  if (val !== (cat.image || "")) handleImageUpdate(cat, val);
                }}
                className="flex-1 px-3 py-2 border border-[#E8E8E8] text-[12px] outline-none focus:border-[#4D5B47] transition-colors"
              />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Site Content Section ──────────────────────────────────────────────────────
function SiteContentSection() {
  const { showNotification } = useStore();
  const [content, setContent] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("hero");

  const tabs = [
    { id: "hero", label: "Hero" },
    { id: "marquee", label: "Marquee" },
    { id: "editorial", label: "Editorial" },
    { id: "features", label: "Features" },
    { id: "stats", label: "Stats" },
    { id: "trust", label: "Trust" },
    { id: "shopFilters", label: "Shop Filters" },
    { id: "paymentMethods", label: "Payment Methods" },
  ];

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => setContent(data.content || {}))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/site-content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        showNotification("Site content updated successfully", "success");
      } else {
        showNotification("Failed to update site content", "error");
      }
    } catch {
      showNotification("Failed to update site content", "error");
    } finally {
      setSaving(false);
    }
  };

  const updateField = (key: string, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-[#999]" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-[#E8E8E8] p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[18px] font-medium">Site Content Management</h2>
        <button suppressHydrationWarning
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[#4D5B47] text-white text-[12px] font-medium tracking-wider uppercase hover:bg-[#3D4B37] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-[#E8E8E8] pb-4">
        {tabs.map((tab) => (
          <button suppressHydrationWarning
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 text-[12px] tracking-wide transition-colors ${
              activeTab === tab.id
                ? "bg-[#111] text-[#F8F8F6]"
                : "bg-[#F0EFED] text-[#666] hover:bg-[#E8E8E8]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Fields */}
      <div className="space-y-4">
        {activeTab === "hero" && (
          <>
            <Field label="Badge" value={content.heroBadge || ""} onChange={(v) => updateField("heroBadge", v)} />
            <Field label="Title" value={content.heroTitle || ""} onChange={(v) => updateField("heroTitle", v)} />
            <Field label="Subtitle" value={content.heroSubtitle || ""} onChange={(v) => updateField("heroSubtitle", v)} />
            <Field label="Primary CTA" value={content.heroCtaPrimary || ""} onChange={(v) => updateField("heroCtaPrimary", v)} />
            <Field label="Secondary CTA" value={content.heroCtaSecondary || ""} onChange={(v) => updateField("heroCtaSecondary", v)} />
            <Field label="Image URL" value={content.heroImage || ""} onChange={(v) => updateField("heroImage", v)} />
          </>
        )}
        {activeTab === "marquee" && (
          <Field label="Marquee Items (JSON array)" value={content.marqueeItems || ""} onChange={(v) => updateField("marqueeItems", v)} multiline />
        )}
        {activeTab === "editorial" && (
          <>
            <Field label="Badge" value={content.editorialBadge || ""} onChange={(v) => updateField("editorialBadge", v)} />
            <Field label="Title" value={content.editorialTitle || ""} onChange={(v) => updateField("editorialTitle", v)} />
            <Field label="Title Color" value={content.editorialTitleColor || ""} onChange={(v) => updateField("editorialTitleColor", v)} />
            <Field label="Text" value={content.editorialText || ""} onChange={(v) => updateField("editorialText", v)} multiline />
            <Field label="Image URL" value={content.editorialImage || ""} onChange={(v) => updateField("editorialImage", v)} />
            <Field label="CTA Text" value={content.editorialCta || ""} onChange={(v) => updateField("editorialCta", v)} />
            <Field label="Label" value={content.editorialLabel || ""} onChange={(v) => updateField("editorialLabel", v)} />
          </>
        )}
        {activeTab === "features" && (
          <Field label="Features (JSON array)" value={content.features || ""} onChange={(v) => updateField("features", v)} multiline />
        )}
        {activeTab === "stats" && (
          <Field label="Stats (JSON array)" value={content.stats || ""} onChange={(v) => updateField("stats", v)} multiline />
        )}
        {activeTab === "trust" && (
          <Field label="Trust Items (JSON array)" value={content.trustItems || ""} onChange={(v) => updateField("trustItems", v)} multiline />
        )}
        {activeTab === "shopFilters" && (
          <Field label="Shop Filters (JSON object)" value={content.shopFilters || ""} onChange={(v) => updateField("shopFilters", v)} multiline />
        )}
        {activeTab === "paymentMethods" && (
          <Field label="Payment Methods (JSON array)" value={content.paymentMethods || ""} onChange={(v) => updateField("paymentMethods", v)} multiline />
        )}
      </div>
    </motion.div>
  );
}

function Field({ label, value, onChange, multiline = false }: {
  label: string; value: string; onChange: (v: string) => void; multiline?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium tracking-wider uppercase text-[#999] mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          suppressHydrationWarning
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#4D5B47] transition-colors resize-y font-mono"
        />
      ) : (
        <input suppressHydrationWarning
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#4D5B47] transition-colors"
        />
      )}
    </div>
  );
}

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

  // Product image editing
  const [editingImage, setEditingImage] = useState<{ id: string; name: string; images: string } | null>(null);
  const [imageUrls, setImageUrls] = useState<string[]>(["", "", ""]);
  const [savingImage, setSavingImage] = useState(false);

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

  // Fetch all orders for orders tab (admin sees ALL orders)
  const fetchOrders = useCallback(async () => {
    setOrdersLoading(true);
    try {
      const res = await fetch("/api/admin/orders?limit=100");
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

  // Handle product image update
  const handleSaveProductImages = async () => {
    if (!editingImage) return;
    setSavingImage(true);
    try {
      const filtered = imageUrls.filter((u) => u.trim());
      const res = await fetch("/api/admin/products", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingImage.id, images: JSON.stringify(filtered) }),
      });
      if (res.ok) {
        showNotification("Product images updated", "success");
        setEditingImage(null);
        fetchProducts();
      } else {
        showNotification("Failed to update images", "error");
      }
    } catch {
      showNotification("Failed to update images", "error");
    }
    setSavingImage(false);
  };

  // Auth guard
  if (authLoading) {
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#999] animate-spin" />
      </main>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-4 flex items-center justify-center">
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
            <button suppressHydrationWarning
              onClick={() => setAuthOpen(true)}
              className="px-8 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors"
            >
              Sign In
            </button>
          ) : (
            <button suppressHydrationWarning
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
    <main className="min-h-screen bg-[#F8F8F6] pt-4">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button suppressHydrationWarning
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
          <button suppressHydrationWarning
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden w-10 h-10 border border-[#E8E8E8] flex items-center justify-center"
          >
            <LayoutDashboard className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex gap-0 lg:gap-8">
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
                <button suppressHydrationWarning
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
                className="fixed inset-0 bg-black/20 z-[49] lg:hidden"
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
                        <button suppressHydrationWarning
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
                    <button suppressHydrationWarning
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
                        <input suppressHydrationWarning
                          type="text"
                          placeholder="Search products..."
                          value={productSearch}
                          onChange={(e) => { setProductSearch(e.target.value); setProductPage(1); }}
                          className="w-full border border-[#E8E8E8] bg-white pl-10 pr-4 py-2.5 text-[13px] outline-none focus:border-[#111] transition-colors placeholder:text-[#999]"
                        />
                      </div>
                      <div className="relative">
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" strokeWidth={1.5} />
                        <select suppressHydrationWarning
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
                                  <button suppressHydrationWarning
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      let imgs: string[] = [];
                                      try { imgs = JSON.parse(product.images || "[]"); } catch {}
                                      setEditingImage({ id: product.id, name: product.name, images: product.images || "[]" });
                                      setImageUrls([imgs[0] || "", imgs[1] || "", imgs[2] || ""]);
                                    }}
                                    className="w-10 h-12 relative overflow-hidden bg-[#F0EFED] hover:ring-2 hover:ring-[#4D5B47] transition-all cursor-pointer"
                                  >
                                    <img
                                      src={(() => { try { const imgs = JSON.parse(product.images || "[]"); return imgs[0] || "/placeholder.jpg"; } catch { return "/placeholder.jpg"; } })()}
                                      alt={product.name}
                                      className="w-10 h-12 object-cover rounded-[2px]"
                                    />
                                  </button>
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
                          <button suppressHydrationWarning
                            disabled={productPage <= 1}
                            onClick={() => setProductPage(productPage - 1)}
                            className="px-3 py-1.5 text-[11px] uppercase tracking-wider text-[#666] border border-[#E8E8E8] hover:border-[#999] disabled:opacity-30 rounded-[4px]"
                          >
                            Prev
                          </button>
                          <span className="text-[11px] text-[#999]">Page {productPage} of {productTotalPages}</span>
                          <button suppressHydrationWarning
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
                          <button suppressHydrationWarning
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
                                    <select suppressHydrationWarning
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

            {/* Site Content Section */}
            {activeSection === "site-content" && (
              <SiteContentSection />
            )}

            {/* Categories Section */}
            {activeSection === "categories" && (
              <CategoriesSection />
            )}

            {/* Coupons Section */}
            {activeSection === "coupons" && (
              <CouponSection />
            )}
          </div>
        </div>
      </div>

      {/* Product Image Editor Modal */}
      {editingImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#E8E8E8] w-full max-w-[500px] p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-[16px] font-medium">Edit Images</h3>
                <p className="text-[12px] text-[#999] mt-0.5">{editingImage.name}</p>
              </div>
              <button suppressHydrationWarning onClick={() => setEditingImage(null)} className="w-8 h-8 flex items-center justify-center hover:bg-[#F0EFED] transition-colors">
                <span className="text-[18px] text-[#666]">×</span>
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {imageUrls.map((url, i) => (
                <div key={i}>
                  <label className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-1 block">
                    Image {i + 1} {i === 0 && "(main)"}
                  </label>
                  <div className="flex gap-2">
                    {url && (
                      <div className="w-12 h-16 bg-[#F0EFED] overflow-hidden flex-shrink-0">
                        <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                      </div>
                    )}
                    <input suppressHydrationWarning
                      type="text"
                      value={url}
                      onChange={(e) => {
                        const next = [...imageUrls];
                        next[i] = e.target.value;
                        setImageUrls(next);
                      }}
                      placeholder="/images/products/product-1.jpg or URL"
                      className="flex-1 px-3 py-2 border border-[#E8E8E8] text-[12px] outline-none focus:border-[#4D5B47] transition-colors"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-2 justify-end">
              <button suppressHydrationWarning
                onClick={() => setEditingImage(null)}
                className="px-4 py-2 border border-[#E8E8E8] text-[12px] font-medium tracking-wide hover:bg-[#F0EFED] transition-colors"
              >
                Cancel
              </button>
              <button suppressHydrationWarning
                onClick={handleSaveProductImages}
                disabled={savingImage}
                className="px-4 py-2 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-wide hover:bg-[#333] transition-colors disabled:opacity-50"
              >
                {savingImage ? "Saving..." : "Save Images"}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </main>
  );
}