"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Package,
  MapPin,
  Settings,
  ChevronDown,
  ChevronUp,
  Check,
  Trash2,
  Pencil,
  Plus,
  LogOut,
  Bell,
  Mail,
  Moon,
  Sun,
  AlertTriangle,
  Gift,
  Crown,
  Star,
  Clock,
  RefreshCw,
  Shield,
  Smartphone,
  Camera,
  TrendingDown,
  Sparkles,
  RotateCcw,
  Truck,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// ── Types ───────────────────────────────────────────────────────────────────
interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
  color?: string;
  image?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  shippingAddress: string;
  paymentMethod: string;
  paymentStatus: string;
  couponCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface Address {
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  [key: string]: string | undefined;
}

interface UserProfile {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  addresses: string;
  paymentMethods: string | null;
  role: string;
  loyaltyPoints: number;
  isVerified: boolean;
  createdAt: string;
}

// ── Constants ───────────────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
  confirmed: "bg-[#4D5B47] text-white",
  shipped: "bg-[#B79B7B] text-white",
  delivered: "bg-[#111111] text-white",
  cancelled: "bg-[#C53030] text-white",
  pending: "bg-[#F0EFED] text-[#666666]",
  processing: "bg-[#F0EFED] text-[#666666]",
};

const TIER_CONFIG = {
  Silver: { min: 0, max: 3000, color: "#999999", nextTier: "Gold", nextMin: 3000, icon: Shield },
  Gold: { min: 3000, max: 10000, color: "#B79B7B", nextTier: "Platinum", nextMin: 10000, icon: Crown },
  Platinum: { min: 10000, max: 100000, color: "#4D5B47", nextTier: null, nextMin: null, icon: Crown },
};

const getEstimatedDelivery = (order: Order) => {
  if (order.status === "delivered" || order.status === "cancelled") return null;
  const created = new Date(order.createdAt);
  const estimated = new Date(created);
  estimated.setDate(estimated.getDate() + (order.status === "confirmed" ? 7 : order.status === "processing" ? 5 : 3));
  return estimated.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const },
};

const getTierForPoints = (points: number): string => {
  if (points >= 10000) return "Platinum";
  if (points >= 3000) return "Gold";
  return "Silver";
};

// ── Loyalty Points Section ──────────────────────────────────────────────────
function LoyaltySection({ points }: { points: number }) {
  const currentTier = getTierForPoints(points) as keyof typeof TIER_CONFIG;
  const config = TIER_CONFIG[currentTier];
  const progressPercent = Math.min(((points - config.min) / (config.max - config.min)) * 100, 100);
  const TierIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
      className="bg-white rounded-[4px] border border-[#E8E8E8] p-5"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[4px] flex items-center justify-center"
            style={{ backgroundColor: config.color + "15" }}
          >
            <TierIcon className="w-5 h-5" style={{ color: config.color }} strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-[#999] font-medium">Loyalty Points</p>
            <p className="text-2xl font-medium text-[#111] mt-0.5">
              {points.toLocaleString("en-IN")}
            </p>
          </div>
        </div>
        <Badge
          className="rounded-[4px] text-[10px] uppercase tracking-wider font-semibold px-2.5 py-1 border-0"
          style={{ backgroundColor: config.color + "15", color: config.color }}
        >
          <Crown className="w-3 h-3 mr-1" />
          {currentTier}
        </Badge>
      </div>

      {config.nextTier && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#666]">Progress to {config.nextTier}</span>
            <span className="text-[#999] font-medium">
              {points.toLocaleString()} / {config.nextMin?.toLocaleString()} pts
            </span>
          </div>
          <div className="relative h-1.5 bg-[#F0EFED] rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 rounded-full"
              style={{ backgroundColor: config.color }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 1, delay: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            />
          </div>
          <p className="text-[11px] text-[#999]">
            Earn {((config.nextMin || 100000) - points).toLocaleString()} more points to unlock{" "}
            <span className="font-medium" style={{ color: config.color }}>{config.nextTier}</span> benefits
          </p>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-[#E8E8E8] flex flex-wrap items-center gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Gift className="w-3.5 h-3.5 text-[#B79B7B]" strokeWidth={1.5} />
          <span className="text-xs text-[#666]">Earn 2x points on weekends</span>
        </div>
        <div className="w-px h-3 bg-[#E8E8E8]" />
        <div className="flex items-center gap-2">
          <Star className="w-3.5 h-3.5 text-[#B79B7B]" strokeWidth={1.5} />
          <span className="text-xs text-[#666]">Birthday bonus: +500 pts</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab({ profile }: { profile: UserProfile | null }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [avatarHover, setAvatarHover] = useState(false);
  const { showNotification } = useStore();
  const { user } = useAuth();

  // Populate from profile
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setEmail(profile.email || "");
      setPhone(profile.phone || "");
    } else if (user) {
      setEmail(user.email || "");
      setName(user.name || "");
    }
  }, [profile, user]);

  const handleSave = async () => {
    setSaving(true);
    setSaveError("");
    try {
      const res = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone }),
      });
      const data = await res.json();
      if (res.ok) {
        showNotification("Profile updated successfully", "success");
      } else {
        setSaveError(data.error || "Failed to update profile");
      }
    } catch {
      setSaveError("Something went wrong");
    }
    setSaving(false);
  };

  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" })
    : "Recently";

  const loyaltyPoints = profile?.loyaltyPoints || 0;
  const currentTier = getTierForPoints(loyaltyPoints);

  return (
    <motion.div {...fadeUp} className="space-y-6">
      {/* Avatar Section */}
      <motion.div
        className="flex items-center gap-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div
          className="relative group cursor-pointer"
          onMouseEnter={() => setAvatarHover(true)}
          onMouseLeave={() => setAvatarHover(false)}
        >
          <div className="w-24 h-24 rounded-[4px] bg-[#4D5B47] flex items-center justify-center text-white text-3xl font-medium select-none shrink-0">
            {initials}
          </div>
          <AnimatePresence>
            {avatarHover && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-[#111]/60 rounded-[4px] flex flex-col items-center justify-center gap-1"
              >
                <Camera className="w-5 h-5 text-white" strokeWidth={1.5} />
                <span className="text-[10px] uppercase tracking-wider text-white/90 font-medium">
                  Edit Photo
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#111]">{name || "User"}</h3>
          <p className="text-sm text-[#666] mt-0.5">Member since {joinDate}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge className="rounded-[4px] text-[10px] uppercase tracking-wider bg-[#B79B7B]/15 text-[#B79B7B] border-0 px-2 py-0.5">
              <Crown className="w-2.5 h-2.5 mr-1" />
              {currentTier} Member
            </Badge>
            {profile?.isVerified && (
              <Badge className="rounded-[4px] text-[10px] uppercase tracking-wider bg-[#4D5B47]/15 text-[#4D5B47] border-0 px-2 py-0.5">
                <Check className="w-2.5 h-2.5 mr-1" />
                Verified
              </Badge>
            )}
          </div>
        </div>
      </motion.div>

      <Separator className="bg-[#E8E8E8]" />

      {/* Loyalty Points Section */}
      <LoyaltySection points={loyaltyPoints} />

      <Separator className="bg-[#E8E8E8]" />

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[13px] uppercase tracking-wider text-[#666]">
            Full Name
          </Label>
          <Input suppressHydrationWarning
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-[4px] border-[#E8E8E8] h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-[13px] uppercase tracking-wider text-[#666]">
            Email
          </Label>
          <Input suppressHydrationWarning
            id="email"
            type="email"
            value={email}
            disabled
            className="rounded-[4px] border-[#E8E8E8] h-11 bg-[#F0EFED] text-[#999]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[13px] uppercase tracking-wider text-[#666]">
            Phone
          </Label>
          <Input suppressHydrationWarning
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-[4px] border-[#E8E8E8] h-11"
          />
        </div>
      </div>

      {saveError && (
        <p className="text-[13px] text-[#C53030]">{saveError}</p>
      )}

      <Button suppressHydrationWarning
        onClick={handleSave}
        disabled={saving}
        className="rounded-[4px] bg-[#111] hover:bg-[#333] text-white h-11 px-8"
      >
        {saving ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          />
        ) : (
          "Save Changes"
        )}
      </Button>
    </motion.div>
  );
}

// ── Orders Tab ──────────────────────────────────────────────────────────────
function OrdersTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const { navigate, addToCart, showNotification } = useStore();

  const fetchOrders = useCallback(async (statusFilter = "all", pageNum = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(pageNum), limit: "10" });
      if (statusFilter !== "all") params.set("status", statusFilter);
      const res = await fetch(`/api/orders?${params}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders(activeFilter, page);
  }, [activeFilter, page, fetchOrders]);

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    const s = o.status.toLowerCase();
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const filterOptions = [
    { key: "all", label: "All" },
    { key: "processing", label: "Processing" },
    { key: "shipped", label: "Shipped" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
    { key: "confirmed", label: "Confirmed" },
  ];

  const handleTrackOrder = (orderNumber: string) => {
    navigate("order-tracking", undefined, orderNumber);
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        id: `${item.id}-${item.size || "M"}-${item.color || "Default"}-reorder`,
        productId: item.id,
        name: item.name,
        price: item.price,
        mrp: item.price,
        image: item.image || "/images/placeholder.jpg",
        size: item.size || "M",
        color: item.color || "Default",
      });
    });
    showNotification(`${order.items.length} item(s) added to cart`, "success");
  };

  if (loading && orders.length === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-[4px] skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (orders.length === 0 && !loading) {
    return (
      <motion.div {...fadeUp} className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#F0EFED] flex items-center justify-center mb-4">
          <Package className="w-7 h-7 text-[#999]" strokeWidth={1.5} />
        </div>
        <h3 className="text-base font-medium text-[#111] mb-1">No orders yet</h3>
        <p className="text-sm text-[#666] max-w-xs">
          Your order history will appear here once you make a purchase.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-wrap gap-2"
      >
        {filterOptions.map((opt) => {
          const count = opt.key === "all" ? total : statusCounts[opt.key] || 0;
          if (opt.key !== "all" && count === 0) return null;
          return (
            <button suppressHydrationWarning
              key={opt.key}
              onClick={() => { setActiveFilter(opt.key); setPage(1); }}
              className={`inline-flex items-center gap-1.5 px-3 h-9 rounded-[4px] text-xs uppercase tracking-wider font-medium border transition-all duration-200 ${
                activeFilter === opt.key
                  ? "bg-[#111] text-white border-[#111]"
                  : "bg-white text-[#666] border-[#E8E8E8] hover:border-[#999] hover:text-[#111]"
              }`}
            >
              {opt.label}
              <span
                className={`text-[10px] min-w-[18px] h-[18px] rounded-[4px] flex items-center justify-center font-semibold ${
                  activeFilter === opt.key
                    ? "bg-white/20 text-white"
                    : "bg-[#F0EFED] text-[#999]"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </motion.div>

      {/* Orders List */}
      <div className="space-y-3">
        {orders.map((order, idx) => {
          const isExpanded = expandedId === order.id;
          const estDelivery = getEstimatedDelivery(order);
          return (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <button suppressHydrationWarning
                onClick={() => setExpandedId(isExpanded ? null : order.id)}
                className="w-full text-left bg-white rounded-[4px] border border-[#E8E8E8] p-4 hover:border-[#999] transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-[#111]">{order.orderNumber}</span>
                      <Badge className={`rounded-[4px] text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 border-0 ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                        {order.status}
                      </Badge>
                      {estDelivery && (
                        <span className="text-[11px] text-[#4D5B47] font-medium flex items-center gap-1">
                          <Truck className="w-3 h-3" strokeWidth={1.5} />
                          Est. {estDelivery}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#666]">
                      {formatDate(order.createdAt)} &middot; {order.items?.length || 0} item{(order.items?.length || 0) > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm font-medium text-[#111]">{formatCurrency(order.total)}</span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[#999]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#999]" />
                    )}
                  </div>
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="bg-white border border-t-0 border-[#E8E8E8] rounded-b-[4px] p-4">
                      <div className="space-y-3">
                        {order.items?.map((item) => (
                          <div key={item.id} className="flex items-center gap-3">
                            {item.image ? (
                              <div className="w-14 h-14 rounded-[4px] bg-[#F0EFED] shrink-0 overflow-hidden">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <div className="w-14 h-14 rounded-[4px] bg-[#F0EFED] shrink-0 flex items-center justify-center">
                                <Package className="w-5 h-5 text-[#999]" strokeWidth={1} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#111] line-clamp-1">{item.name}</p>
                              <p className="text-xs text-[#666]">
                                {item.size && `Size: ${item.size}`}
                                {item.size && item.color && " · "}
                                {item.color && `Color: ${item.color}`}
                                {" · Qty: "}{item.quantity}
                              </p>
                            </div>
                            <span className="text-sm text-[#111] shrink-0">
                              {formatCurrency(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator className="bg-[#E8E8E8] my-4" />

                      <div className="flex items-center justify-between text-sm">
                        <div className="text-[#666]">
                          <p>Payment: <span className="text-[#111] font-medium capitalize">{order.paymentMethod}</span></p>
                          <p>Payment Status: <span className="text-[#111] font-medium capitalize">{order.paymentStatus}</span></p>
                          {order.couponCode && (
                            <p>Coupon: <span className="text-[#4D5B47] font-medium">{order.couponCode}</span></p>
                          )}
                        </div>
                        <div className="text-right space-y-0.5">
                          {order.discount > 0 && (
                            <p className="text-xs text-[#C53030]">- {formatCurrency(order.discount)}</p>
                          )}
                          {order.shipping > 0 && (
                            <p className="text-xs text-[#666]">+ {formatCurrency(order.shipping)} shipping</p>
                          )}
                          <p className="font-medium text-[#111]">Total: {formatCurrency(order.total)}</p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#E8E8E8]">
                        {(order.status === "confirmed" || order.status === "shipped" || order.status === "processing") && (
                          <Button suppressHydrationWarning
                            variant="outline"
                            onClick={() => handleTrackOrder(order.orderNumber)}
                            className="rounded-[4px] border-[#4D5B47] text-[#4D5B47] hover:bg-[#4D5B47]/5 h-9 text-xs uppercase tracking-wider"
                          >
                            <Truck className="w-3.5 h-3.5 mr-1.5" />
                            Track Order
                          </Button>
                        )}
                        {order.status !== "cancelled" && (
                          <Button suppressHydrationWarning
                            variant="outline"
                            onClick={() => handleReorder(order)}
                            className="rounded-[4px] border-[#E8E8E8] h-9 text-xs uppercase tracking-wider hover:border-[#999]"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                            Reorder
                          </Button>
                        )}
                        {(order.status === "confirmed" || order.status === "processing") && (
                          <Button suppressHydrationWarning
                            variant="outline"
                            onClick={async () => {
                              if (!confirm("Are you sure you want to cancel this order?")) return;
                              try {
                                const res = await fetch(`/api/orders/${order.orderNumber}`, {
                                  method: "PATCH",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify({ status: "cancelled" }),
                                });
                                if (res.ok) {
                                  showNotification("Order cancelled", "success");
                                  fetchOrders(activeFilter, page);
                                } else {
                                  showNotification("Failed to cancel order", "error");
                                }
                              } catch {
                                showNotification("Failed to cancel order", "error");
                              }
                            }}
                            className="rounded-[4px] border-[#C53030]/30 text-[#C53030] hover:bg-[#C53030]/5 h-9 text-xs uppercase tracking-wider"
                          >
                            Cancel Order
                          </Button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button suppressHydrationWarning
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-2 border border-[#E8E8E8] rounded-[4px] text-xs uppercase tracking-wider text-[#666] hover:border-[#999] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-xs text-[#999] px-2">
            Page {page} of {totalPages}
          </span>
          <button suppressHydrationWarning
            disabled={page >= totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-2 border border-[#E8E8E8] rounded-[4px] text-xs uppercase tracking-wider text-[#666] hover:border-[#999] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <motion.div {...fadeUp} className="flex flex-col items-center justify-center py-12 text-center">
          <Package className="w-8 h-8 text-[#ccc] mb-3" strokeWidth={1.5} />
          <p className="text-sm text-[#666]">No {activeFilter} orders found</p>
          <button suppressHydrationWarning
            onClick={() => { setActiveFilter("all"); setPage(1); }}
            className="text-xs text-[#4D5B47] font-medium uppercase tracking-wider mt-2 hover:underline"
          >
            View all orders
          </button>
        </motion.div>
      )}
    </div>
  );
}

// ── Addresses Tab ───────────────────────────────────────────────────────────
function AddressesTab({ profile, onAddressesChange }: { profile: UserProfile | null; onAddressesChange: () => void }) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", street: "", city: "", state: "", zip: "", phone: "" });
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const { showNotification } = useStore();

  // Load addresses from profile
  useEffect(() => {
    if (!profile) { setLoading(false); return; }
    try {
      const parsed = profile.addresses ? JSON.parse(profile.addresses) : [];
      setAddresses(Array.isArray(parsed) ? parsed : []);
    } catch {
      setAddresses([]);
    }
    setLoading(false);
  }, [profile]);

  const openNew = () => {
    setForm({ name: profile?.name || "", street: "", city: "", state: "", zip: "", phone: profile?.phone || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.street || !form.city) return;
    setSaving(true);
    try {
      const newAddr = { ...form };
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAddr),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses || [...addresses, newAddr]);
        showNotification("Address added", "success");
        setDialogOpen(false);
        onAddressesChange();
      } else {
        showNotification(data.error || "Failed to add address", "error");
      }
    } catch {
      showNotification("Failed to add address", "error");
    }
    setSaving(false);
  };

  const handleDelete = async (index: number) => {
    try {
      const res = await fetch("/api/user/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses || addresses.filter((_, i) => i !== index));
        showNotification("Address removed", "info");
        onAddressesChange();
      } else {
        showNotification(data.error || "Failed to remove address", "error");
      }
    } catch {
      showNotification("Failed to remove address", "error");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-[4px] skeleton-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <motion.div {...fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-[#111]">Saved Addresses</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button suppressHydrationWarning
              onClick={openNew}
              variant="outline"
              className="rounded-[4px] border-[#E8E8E8] h-9 text-xs uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" />
              Add New
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[4px] max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base font-medium">Add New Address</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[13px] uppercase tracking-wider text-[#666]">Full Name</Label>
                <Input suppressHydrationWarning value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] uppercase tracking-wider text-[#666]">Street Address</Label>
                <Textarea value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="rounded-[4px] border-[#E8E8E8] min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] uppercase tracking-wider text-[#666]">City</Label>
                  <Input suppressHydrationWarning value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] uppercase tracking-wider text-[#666]">State</Label>
                  <Input suppressHydrationWarning value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] uppercase tracking-wider text-[#666]">PIN Code</Label>
                  <Input suppressHydrationWarning value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] uppercase tracking-wider text-[#666]">Phone</Label>
                  <Input suppressHydrationWarning value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
                </div>
              </div>
              <Button suppressHydrationWarning onClick={handleSave} disabled={saving} className="rounded-[4px] bg-[#111] hover:bg-[#333] text-white h-10 w-full">
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : "Save Address"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <motion.div {...fadeUp} className="flex flex-col items-center justify-center py-12 text-center">
          <MapPin className="w-8 h-8 text-[#ccc] mb-3" strokeWidth={1.5} />
          <h3 className="text-base font-medium text-[#111] mb-1">No saved addresses</h3>
          <p className="text-sm text-[#666] max-w-xs">
            Add a shipping address for faster checkout.
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {addresses.map((addr, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.3 }}
              className="bg-white rounded-[4px] border border-[#E8E8E8] p-4 hover:border-[#999] transition-colors"
              onMouseEnter={() => setHoveredId(String(idx))}
              onMouseLeave={() => setHoveredId(null)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <motion.div
                      animate={hoveredId === String(idx) ? { y: -2 } : { y: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                      <MapPin className="w-4 h-4 text-[#4D5B47]" strokeWidth={1.5} />
                    </motion.div>
                    <span className="text-sm font-medium text-[#111]">{addr.name}</span>
                    {idx === 0 && (
                      <Badge className="rounded-[4px] text-[10px] uppercase tracking-wider bg-[#4D5B47] text-white border-0 px-2 py-0.5">
                        Default
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-[#666] leading-relaxed pl-6">
                    {addr.street}
                    <br />
                    {addr.city}, {addr.state} — {addr.zip}
                  </p>
                  <p className="text-xs text-[#999] mt-1 pl-6">{addr.phone}</p>
                </div>
                <Button suppressHydrationWarning
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(idx)}
                  className="rounded-[4px] h-8 w-8 hover:text-[#C53030]"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Notifications Tab ────────────────────────────────────────────────────────
function NotificationsTab() {
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    time: string;
    read: boolean;
    orderNumber: string | null;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "order": return Package;
      case "system": return Star;
      default: return Sparkles;
    }
  };

  const getRelativeTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <motion.div {...fadeUp} className="space-y-3">
        <h3 className="text-base font-medium text-[#111] mb-4">Notifications</h3>
        <p className="text-[13px] text-[#999]">Loading notifications...</p>
      </motion.div>
    );
  }

  return (
    <motion.div {...fadeUp} className="space-y-3">
      <h3 className="text-base font-medium text-[#111] mb-4">Notifications</h3>
      {notifications.length === 0 ? (
        <p className="text-[13px] text-[#999]">No notifications yet.</p>
      ) : (
        notifications.map((notif, idx) => {
          const Icon = getIcon(notif.type);
          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05, duration: 0.25 }}
              className={`bg-white rounded-[4px] border p-4 ${notif.read ? "border-[#E8E8E8]" : "border-[#4D5B47]/30 bg-[#4D5B47]/[0.02]"}`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#F0EFED] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4 h-4 text-[#666]" strokeWidth={1.5} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-[#111]">{notif.title}</p>
                    {!notif.read && <div className="w-2 h-2 rounded-full bg-[#4D5B47]" />}
                  </div>
                  <p className="text-xs text-[#666] mt-0.5">{notif.message}</p>
                  <p className="text-[11px] text-[#999] mt-1">{getRelativeTime(notif.time)}</p>
                </div>
              </div>
            </motion.div>
          );
        })
      )}
    </motion.div>
  );
}

// ── Settings Tab ────────────────────────────────────────────────────────────
function SettingsTab() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [priceDropAlerts, setPriceDropAlerts] = useState(true);
  const [newArrivals, setNewArrivals] = useState(false);
  const [restockAlerts, setRestockAlerts] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [connectedAccounts, setConnectedAccounts] = useState({
    google: true,
    apple: false,
    facebook: false,
  });
  const { showNotification } = useStore();
  const { logout } = useAuth();

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    showNotification(`Theme set to ${next}`, "info");
  };

  const toggleAccount = (provider: keyof typeof connectedAccounts) => {
    const newState = !connectedAccounts[provider];
    setConnectedAccounts((prev) => ({ ...prev, [provider]: newState }));
    showNotification(
      newState ? `${provider.charAt(0).toUpperCase() + provider.slice(1)} connected` : `${provider.charAt(0).toUpperCase() + provider.slice(1)} disconnected`,
      newState ? "success" : "info"
    );
  };

  const notificationPreferences = [
    { key: "orderUpdates" as const, label: "Order Updates", description: "Get notified about your order status", icon: Package, checked: orderUpdates, onChange: setOrderUpdates },
    { key: "promoEmails" as const, label: "Promotional Emails", description: "Receive offers and sale alerts", icon: Bell, checked: promoEmails, onChange: setPromoEmails },
    { key: "priceDropAlerts" as const, label: "Price Drop Alerts", description: "Get notified when wishlist items go on sale", icon: TrendingDown, checked: priceDropAlerts, onChange: setPriceDropAlerts },
    { key: "newArrivals" as const, label: "New Arrivals", description: "Be the first to know about new collections", icon: Sparkles, checked: newArrivals, onChange: setNewArrivals },
    { key: "restockAlerts" as const, label: "Restock Alerts", description: "Get notified when out-of-stock items return", icon: RefreshCw, checked: restockAlerts, onChange: setRestockAlerts },
    { key: "newsletter" as const, label: "Newsletter", description: "Weekly style picks and editorials", icon: Mail, checked: newsletter, onChange: setNewsletter },
  ];

  const connectedAccountList = [
    { provider: "google" as const, label: "Google", icon: "G", color: "#4285F4", bgColor: "#4285F410" },
    { provider: "apple" as const, label: "Apple", icon: "", color: "#111", bgColor: "#11111108", isApple: true },
    { provider: "facebook" as const, label: "Facebook", icon: "f", color: "#1877F2", bgColor: "#1877F210" },
  ];

  return (
    <motion.div {...fadeUp} className="space-y-8">
      {/* Notification Preferences */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
        <h3 className="text-base font-medium text-[#111] mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          {notificationPreferences.map((pref, idx) => {
            const Icon = pref.icon;
            return (
              <motion.div
                key={pref.key}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08 + idx * 0.04, duration: 0.25 }}
                className="flex items-center justify-between bg-white rounded-[4px] border border-[#E8E8E8] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-[4px] bg-[#F0EFED] flex items-center justify-center">
                    <Icon className="w-4 h-4 text-[#666]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#111]">{pref.label}</p>
                    <p className="text-xs text-[#666]">{pref.description}</p>
                  </div>
                </div>
                <Switch checked={pref.checked} onCheckedChange={pref.onChange} className="data-[state=checked]:bg-[#4D5B47]" />
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      <Separator className="bg-[#E8E8E8]" />

      {/* Theme */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <h3 className="text-base font-medium text-[#111] mb-4">Appearance</h3>
        <div className="bg-white rounded-[4px] border border-[#E8E8E8] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#F0EFED] flex items-center justify-center">
                {theme === "light" ? <Sun className="w-4 h-4 text-[#666]" strokeWidth={1.5} /> : <Moon className="w-4 h-4 text-[#666]" strokeWidth={1.5} />}
              </div>
              <div>
                <p className="text-sm font-medium text-[#111]">Theme</p>
                <p className="text-xs text-[#666]">Current: {theme === "light" ? "Light Mode" : "Dark Mode"}</p>
              </div>
            </div>
            <Button suppressHydrationWarning variant="outline" onClick={toggleTheme} className="rounded-[4px] border-[#E8E8E8] h-9 text-xs uppercase tracking-wider">
              {theme === "light" ? "Switch to Dark" : "Switch to Light"}
            </Button>
          </div>
        </div>
      </motion.div>

      <Separator className="bg-[#E8E8E8]" />

      {/* Connected Accounts */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <h3 className="text-base font-medium text-[#111] mb-4">Connected Accounts</h3>
        <div className="space-y-3">
          {connectedAccountList.map((account, idx) => (
            <motion.div
              key={account.provider}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 + idx * 0.05, duration: 0.25 }}
              className="flex items-center justify-between bg-white rounded-[4px] border border-[#E8E8E8] p-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: account.bgColor }}>
                  {account.isApple ? (
                    <Smartphone className="w-4 h-4" style={{ color: account.color }} strokeWidth={1.5} />
                  ) : (
                    <span className="text-sm font-bold" style={{ color: account.color }}>{account.icon}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#111]">{account.label}</p>
                  <p className="text-xs text-[#666]">{connectedAccounts[account.provider] ? "Connected" : "Not connected"}</p>
                </div>
              </div>
              <Button suppressHydrationWarning
                variant={connectedAccounts[account.provider] ? "outline" : "default"}
                onClick={() => toggleAccount(account.provider)}
                className={`rounded-[4px] h-8 text-xs uppercase tracking-wider px-3 ${
                  connectedAccounts[account.provider]
                    ? "border-[#E8E8E8] text-[#666] hover:border-[#C53030] hover:text-[#C53030] hover:bg-[#C53030]/5"
                    : "bg-[#111] hover:bg-[#333] text-white"
                }`}
              >
                {connectedAccounts[account.provider] ? "Disconnect" : "Connect"}
              </Button>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <Separator className="bg-[#E8E8E8]" />

      {/* Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 className="text-base font-medium text-[#C53030] mb-4">Danger Zone</h3>
        <div className="rounded-[4px] border border-[#C53030]/20 p-4 space-y-3">
          <p className="text-xs text-[#666] mb-2">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button suppressHydrationWarning
                  variant="outline"
                  className="rounded-[4px] border-[#C53030] text-[#C53030] hover:bg-[#C53030] hover:text-white h-10 text-xs uppercase tracking-wider transition-colors"
                >
                  <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-[4px]">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your data including orders, addresses, and preferences will be permanently removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="rounded-[4px]">Cancel</AlertDialogCancel>
                  <AlertDialogAction className="rounded-[4px] bg-[#C53030] hover:bg-[#C53030]/90 text-white">
                    Delete Account
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button suppressHydrationWarning
              variant="outline"
              className="rounded-[4px] border-[#E8E8E8] h-10 text-xs uppercase tracking-wider"
              onClick={async () => { await logout(); showNotification("Logged out", "info"); }}
            >
              <LogOut className="w-3.5 h-3.5 mr-1.5" />
              Log Out
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Account Page ───────────────────────────────────────────────────────
export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const { isAuthenticated, setAuthOpen } = useAuth();

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user");
      const data = await res.json();
      if (res.ok) setProfile(data.user || data);
    } catch {}
    setProfileLoading(false);
  }, []);

  useEffect(() => {
    if (isAuthenticated) fetchProfile();
  }, [isAuthenticated, fetchProfile]);

  // Auth guard
  if (!isAuthenticated) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="min-h-screen bg-[#F8F8F6] pt-4 flex items-center justify-center"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm mx-auto px-4"
        >
          <div className="w-20 h-20 bg-[#F0EFED] rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-8 h-8 text-[#999]" strokeWidth={1.5} />
          </div>
          <h2 className="text-[22px] font-medium tracking-[-0.02em] mb-2">Please Sign In</h2>
          <p className="text-[14px] text-[#666] mb-8">
            Sign in to view your account, orders, and manage your profile.
          </p>
          <button suppressHydrationWarning
            onClick={() => setAuthOpen(true)}
            className="px-8 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors"
          >
            Sign In
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-[#F8F8F6]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-medium text-[#111] tracking-tight">My Account</h1>
          <p className="text-sm text-[#666] mt-1">Manage your profile, orders, and settings</p>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white rounded-[4px] border border-[#E8E8E8] p-1 h-auto w-full sm:w-auto mb-8 overflow-x-auto scrollbar-none">
            <TabsTrigger
              value="profile"
              className="rounded-[4px] flex-1 sm:flex-initial gap-2 px-4 h-10 text-xs uppercase tracking-wider font-medium data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <User className="w-3.5 h-3.5" />
              Profile
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-[4px] flex-1 sm:flex-initial gap-2 px-4 h-10 text-xs uppercase tracking-wider font-medium data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Package className="w-3.5 h-3.5" />
              Orders
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="rounded-[4px] flex-1 sm:flex-initial gap-2 px-4 h-10 text-xs uppercase tracking-wider font-medium data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <MapPin className="w-3.5 h-3.5" />
              Addresses
            </TabsTrigger>
            <TabsTrigger
              value="notifications"
              className="rounded-[4px] flex-1 sm:flex-initial gap-2 px-4 h-10 text-xs uppercase tracking-wider font-medium data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Bell className="w-3.5 h-3.5" />
              Alerts
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-[4px] flex-1 sm:flex-initial gap-2 px-4 h-10 text-xs uppercase tracking-wider font-medium data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Settings className="w-3.5 h-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            {profileLoading ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-20 h-20 rounded-[4px]" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <Skeleton className="h-32 w-full rounded-[4px]" />
                <Skeleton className="h-16 w-full rounded-[4px]" />
              </div>
            ) : (
              <ProfileTab profile={profile} />
            )}
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="addresses">
            <AddressesTab profile={profile} onAddressesChange={fetchProfile} />
          </TabsContent>
          <TabsContent value="notifications">
            <NotificationsTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}