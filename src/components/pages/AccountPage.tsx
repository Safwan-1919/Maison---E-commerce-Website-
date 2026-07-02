"use client";

import { useState, useEffect } from "react";
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
} from "lucide-react";
import { useStore } from "@/lib/store";
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
  createdAt: string;
  updatedAt: string;
}

interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
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

const MOCK_ORDERS: Order[] = [
  {
    id: "1",
    orderNumber: "MSN-K4X9P2",
    status: "delivered",
    total: 12490,
    subtotal: 12990,
    discount: 500,
    shipping: 0,
    shippingAddress: JSON.stringify({
      name: "Arjun Mehta",
      street: "42, Altamount Road",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400026",
    }),
    paymentMethod: "card",
    paymentStatus: "completed",
    createdAt: "2025-01-15T10:30:00Z",
    updatedAt: "2025-01-20T14:00:00Z",
    items: [
      { id: "i1", name: "Italian Wool Overcoat", price: 8990, quantity: 1, size: "M", color: "Charcoal", image: "" },
      { id: "i2", name: "Merino Crew Neck Tee", price: 2000, quantity: 2, size: "L", color: "Ivory", image: "" },
    ],
  },
  {
    id: "2",
    orderNumber: "MSN-R7W3N1",
    status: "shipped",
    total: 6490,
    subtotal: 6490,
    discount: 0,
    shipping: 0,
    shippingAddress: JSON.stringify({
      name: "Arjun Mehta",
      street: "42, Altamount Road",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400026",
    }),
    paymentMethod: "upi",
    paymentStatus: "completed",
    createdAt: "2025-02-08T15:45:00Z",
    updatedAt: "2025-02-10T09:20:00Z",
    items: [
      { id: "i3", name: "Linen Relaxed Trousers", price: 4490, quantity: 1, size: "32", color: "Sand", image: "" },
      { id: "i4", name: "Leather Minimal Belt", price: 2000, quantity: 1, size: "M", color: "Black", image: "" },
    ],
  },
  {
    id: "3",
    orderNumber: "MSN-P2Q8T5",
    status: "confirmed",
    total: 3490,
    subtotal: 3490,
    discount: 0,
    shipping: 0,
    shippingAddress: JSON.stringify({
      name: "Arjun Mehta",
      street: "7, Juhu Tara Road",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400049",
    }),
    paymentMethod: "card",
    paymentStatus: "completed",
    createdAt: "2025-02-12T11:00:00Z",
    updatedAt: "2025-02-12T11:05:00Z",
    items: [
      { id: "i5", name: "Cashmere V-Neck Sweater", price: 3490, quantity: 1, size: "S", color: "Olive", image: "" },
    ],
  },
  {
    id: "4",
    orderNumber: "MSN-L5M1X8",
    status: "cancelled",
    total: 5490,
    subtotal: 5490,
    discount: 0,
    shipping: 0,
    shippingAddress: JSON.stringify({
      name: "Arjun Mehta",
      street: "42, Altamount Road",
      city: "Mumbai",
      state: "Maharashtra",
      zip: "400026",
    }),
    paymentMethod: "card",
    paymentStatus: "refunded",
    createdAt: "2024-12-28T09:15:00Z",
    updatedAt: "2024-12-30T16:30:00Z",
    items: [
      { id: "i6", name: "Structured Blazer", price: 5490, quantity: 1, size: "L", color: "Navy", image: "" },
    ],
  },
];

const INITIAL_ADDRESSES: Address[] = [
  {
    id: "a1",
    name: "Arjun Mehta",
    street: "42, Altamount Road",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400026",
    phone: "+91 98765 43210",
    isDefault: true,
  },
  {
    id: "a2",
    name: "Arjun Mehta",
    street: "7, Juhu Tara Road, Juhu",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400049",
    phone: "+91 98765 43210",
    isDefault: false,
  },
  {
    id: "a3",
    name: "Office - Arjun Mehta",
    street: "14th Floor, BKC Tower",
    city: "Mumbai",
    state: "Maharashtra",
    zip: "400051",
    phone: "+91 87654 32109",
    isDefault: false,
  },
];

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount);

const formatDate = (dateStr: string) =>
  new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] },
};

// ── Profile Tab ─────────────────────────────────────────────────────────────
function ProfileTab() {
  const [name, setName] = useState("Arjun Mehta");
  const [email, setEmail] = useState("arjun.mehta@email.com");
  const [phone, setPhone] = useState("+91 98765 43210");
  const [saving, setSaving] = useState(false);
  const { showNotification } = useStore();

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    showNotification("Profile updated successfully", "success");
  };

  return (
    <motion.div {...fadeUp} className="space-y-8">
      {/* Avatar Section */}
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#4D5B47] flex items-center justify-center text-white text-2xl font-medium select-none shrink-0">
          AM
        </div>
        <div>
          <h3 className="text-lg font-medium text-[#111]">Arjun Mehta</h3>
          <p className="text-sm text-[#666] mt-0.5">Member since January 2024</p>
        </div>
      </div>

      <Separator className="bg-[#E8E8E8]" />

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-[13px] uppercase tracking-wider text-[#666]">
            Full Name
          </Label>
          <Input
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
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-[4px] border-[#E8E8E8] h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-[13px] uppercase tracking-wider text-[#666]">
            Phone
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-[4px] border-[#E8E8E8] h-11"
          />
        </div>
      </div>

      <Button
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

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        if (data.orders && data.orders.length > 0) {
          setOrders(data.orders);
        } else {
          setOrders(MOCK_ORDERS);
        }
      } catch {
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-24 w-full rounded-[4px] skeleton-shimmer" />
        ))}
      </div>
    );
  }

  if (orders.length === 0) {
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
    <div className="space-y-3">
      {orders.map((order, idx) => {
        const isExpanded = expandedId === order.id;
        return (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <button
              onClick={() => setExpandedId(isExpanded ? null : order.id)}
              className="w-full text-left bg-white rounded-[4px] border border-[#E8E8E8] p-4 hover:border-[#999] transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-medium text-[#111]">{order.orderNumber}</span>
                    <Badge className={`rounded-[4px] text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 border-0 ${STATUS_COLORS[order.status] || STATUS_COLORS.pending}`}>
                      {order.status}
                    </Badge>
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
                          <div className="w-14 h-14 rounded-[4px] bg-[#F0EFED] shrink-0 flex items-center justify-center">
                            <Package className="w-5 h-5 text-[#999]" strokeWidth={1} />
                          </div>
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

// ── Addresses Tab ───────────────────────────────────────────────────────────
function AddressesTab() {
  const [addresses, setAddresses] = useState<Address[]>(INITIAL_ADDRESSES);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", street: "", city: "", state: "", zip: "", phone: "" });
  const { showNotification } = useStore();

  const openNew = () => {
    setEditingId(null);
    setForm({ name: "", street: "", city: "", state: "", zip: "", phone: "" });
    setDialogOpen(true);
  };

  const openEdit = (addr: Address) => {
    setEditingId(addr.id);
    setForm({ name: addr.name, street: addr.street, city: addr.city, state: addr.state, zip: addr.zip, phone: addr.phone });
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.street || !form.city) return;
    if (editingId) {
      setAddresses((prev) =>
        prev.map((a) => (a.id === editingId ? { ...a, ...form } : a))
      );
      showNotification("Address updated", "success");
    } else {
      const newAddr: Address = {
        id: `a${Date.now()}`,
        ...form,
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
      showNotification("Address added", "success");
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showNotification("Address removed", "info");
  };

  const setDefault = (id: string) => {
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === id })));
    showNotification("Default address updated", "success");
  };

  return (
    <motion.div {...fadeUp} className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-medium text-[#111]">Saved Addresses</h3>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
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
              <DialogTitle className="text-base font-medium">
                {editingId ? "Edit Address" : "Add New Address"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-[13px] uppercase tracking-wider text-[#666]">Full Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] uppercase tracking-wider text-[#666]">Street Address</Label>
                <Textarea value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="rounded-[4px] border-[#E8E8E8] min-h-[60px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] uppercase tracking-wider text-[#666]">City</Label>
                  <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] uppercase tracking-wider text-[#666]">State</Label>
                  <Input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-[13px] uppercase tracking-wider text-[#666]">PIN Code</Label>
                  <Input value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[13px] uppercase tracking-wider text-[#666]">Phone</Label>
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="rounded-[4px] border-[#E8E8E8] h-10" />
                </div>
              </div>
              <Button onClick={handleSave} className="rounded-[4px] bg-[#111] hover:bg-[#333] text-white h-10 w-full">
                {editingId ? "Update Address" : "Save Address"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-3">
        {addresses.map((addr, idx) => (
          <motion.div
            key={addr.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05, duration: 0.3 }}
            className="bg-white rounded-[4px] border border-[#E8E8E8] p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-[#111]">{addr.name}</span>
                  {addr.isDefault && (
                    <Badge className="rounded-[4px] text-[10px] uppercase tracking-wider bg-[#4D5B47] text-white border-0 px-2 py-0.5">
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[#666] leading-relaxed">
                  {addr.street}
                  <br />
                  {addr.city}, {addr.state} — {addr.zip}
                </p>
                <p className="text-xs text-[#999] mt-1">{addr.phone}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {!addr.isDefault && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDefault(addr.id)}
                    className="rounded-[4px] h-8 w-8"
                    title="Set as default"
                  >
                    <Check className="w-3.5 h-3.5 text-[#666]" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openEdit(addr)}
                  className="rounded-[4px] h-8 w-8"
                  title="Edit"
                >
                  <Pencil className="w-3.5 h-3.5 text-[#666]" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(addr.id)}
                  className="rounded-[4px] h-8 w-8 hover:text-[#C53030]"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

// ── Settings Tab ────────────────────────────────────────────────────────────
function SettingsTab() {
  const [orderUpdates, setOrderUpdates] = useState(true);
  const [promoEmails, setPromoEmails] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const { showNotification } = useStore();

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    setTheme(next);
    showNotification(`Theme set to ${next}`, "info");
  };

  return (
    <motion.div {...fadeUp} className="space-y-8">
      {/* Notifications */}
      <div>
        <h3 className="text-base font-medium text-[#111] mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white rounded-[4px] border border-[#E8E8E8] p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#F0EFED] flex items-center justify-center">
                <Package className="w-4 h-4 text-[#666]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111]">Order Updates</p>
                <p className="text-xs text-[#666]">Get notified about your order status</p>
              </div>
            </div>
            <Switch checked={orderUpdates} onCheckedChange={setOrderUpdates} className="data-[state=checked]:bg-[#4D5B47]" />
          </div>

          <div className="flex items-center justify-between bg-white rounded-[4px] border border-[#E8E8E8] p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#F0EFED] flex items-center justify-center">
                <Bell className="w-4 h-4 text-[#666]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111]">Promotional Emails</p>
                <p className="text-xs text-[#666]">Receive offers and sale alerts</p>
              </div>
            </div>
            <Switch checked={promoEmails} onCheckedChange={setPromoEmails} className="data-[state=checked]:bg-[#4D5B47]" />
          </div>

          <div className="flex items-center justify-between bg-white rounded-[4px] border border-[#E8E8E8] p-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#F0EFED] flex items-center justify-center">
                <Mail className="w-4 h-4 text-[#666]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#111]">Newsletter</p>
                <p className="text-xs text-[#666]">Weekly style picks and editorials</p>
              </div>
            </div>
            <Switch checked={newsletter} onCheckedChange={setNewsletter} className="data-[state=checked]:bg-[#4D5B47]" />
          </div>
        </div>
      </div>

      <Separator className="bg-[#E8E8E8]" />

      {/* Theme */}
      <div>
        <h3 className="text-base font-medium text-[#111] mb-4">Appearance</h3>
        <div className="bg-white rounded-[4px] border border-[#E8E8E8] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-[4px] bg-[#F0EFED] flex items-center justify-center">
                {theme === "light" ? (
                  <Sun className="w-4 h-4 text-[#666]" strokeWidth={1.5} />
                ) : (
                  <Moon className="w-4 h-4 text-[#666]" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-[#111]">Theme</p>
                <p className="text-xs text-[#666]">Current: {theme === "light" ? "Light Mode" : "Dark Mode"}</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={toggleTheme}
              className="rounded-[4px] border-[#E8E8E8] h-9 text-xs uppercase tracking-wider"
            >
              {theme === "light" ? "Switch to Dark" : "Switch to Light"}
            </Button>
          </div>
        </div>
      </div>

      <Separator className="bg-[#E8E8E8]" />

      {/* Danger Zone */}
      <div>
        <h3 className="text-base font-medium text-[#C53030] mb-4">Danger Zone</h3>
        <div className="space-y-3">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="rounded-[4px] border-[#C53030]/30 text-[#C53030] hover:bg-[#C53030]/5 h-10 text-xs uppercase tracking-wider"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
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

          <Button
            variant="outline"
            className="rounded-[4px] border-[#E8E8E8] h-10 text-xs uppercase tracking-wider"
            onClick={() => showNotification("Logged out", "info")}
          >
            <LogOut className="w-3.5 h-3.5" />
            Log Out
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Account Page ───────────────────────────────────────────────────────
export default function AccountPage() {
  const [activeTab, setActiveTab] = useState("profile");

  return (
    <div className="min-h-screen bg-[#F8F8F6]">
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
              <span className="hidden sm:inline">Profile</span>
              <span className="sm:hidden">Profile</span>
            </TabsTrigger>
            <TabsTrigger
              value="orders"
              className="rounded-[4px] flex-1 sm:flex-initial gap-2 px-4 h-10 text-xs uppercase tracking-wider font-medium data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Package className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Orders</span>
              <span className="sm:hidden">Orders</span>
            </TabsTrigger>
            <TabsTrigger
              value="addresses"
              className="rounded-[4px] flex-1 sm:flex-initial gap-2 px-4 h-10 text-xs uppercase tracking-wider font-medium data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <MapPin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Addresses</span>
              <span className="sm:hidden">Address</span>
            </TabsTrigger>
            <TabsTrigger
              value="settings"
              className="rounded-[4px] flex-1 sm:flex-initial gap-2 px-4 h-10 text-xs uppercase tracking-wider font-medium data-[state=active]:bg-[#111] data-[state=active]:text-white data-[state=active]:shadow-none"
            >
              <Settings className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Settings</span>
              <span className="sm:hidden">Settings</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="addresses">
            <AddressesTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}