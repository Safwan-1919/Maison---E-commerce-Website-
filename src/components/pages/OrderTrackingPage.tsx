"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import {
  Search, Package, Truck, CheckCircle, MapPin,
  Clock, ChevronRight, ArrowLeft, Check,
  ShoppingBag, ClipboardCheck, RotateCcw,
  Calendar
} from "lucide-react";

interface TrackingStep {
  label: string;
  date: string;
  time: string;
  description: string;
  completed: boolean;
  current: boolean;
}

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  size: string;
  color: string;
  image: string;
}

interface OrderData {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string;
  } | null;
  createdAt: string;
  items: OrderItem[];
}

const stepIcons = [ShoppingBag, ClipboardCheck, Truck, Package, CheckCircle];

function getEstimatedDelivery(status: string, createdAt: string): string | null {
  if (status === "delivered") return null;
  if (status === "cancelled") return null;
  const date = new Date(createdAt);
  date.setDate(date.getDate() + 3);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function OrderTrackingPage() {
  const { navigate, addToCart, selectedOrderNumber } = useStore();
  const [orderInput, setOrderInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<OrderData | null>(null);
  const [trackingSteps, setTrackingSteps] = useState<TrackingStep[]>([]);
  const [reordered, setReordered] = useState(false);

  // Auto-fill and track if navigated with an order number
  useEffect(() => {
    if (selectedOrderNumber) {
      setOrderInput(selectedOrderNumber);
      // Auto-trigger tracking
      const trackOrder = async () => {
        setLoading(true);
        setError("");
        setOrder(null);
        try {
          const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(selectedOrderNumber)}`);
          if (!res.ok) {
            const data = await res.json();
            setError(data.error || "Order not found");
            return;
          }
          const data = await res.json();
          setOrder(data.order);
          setTrackingSteps(data.trackingSteps);
        } catch {
          setError("Failed to track order. Please try again.");
        } finally {
          setLoading(false);
        }
      };
      trackOrder();
    }
  }, [selectedOrderNumber]);

  const handleTrack = async () => {
    if (!orderInput.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/track?orderNumber=${encodeURIComponent(orderInput.trim())}`);
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Order not found");
        return;
      }
      const data = await res.json();
      setOrder(data.order);
      setTrackingSteps(data.trackingSteps);
    } catch {
      setError("Failed to track order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = () => {
    if (!order) return;
    order.items.forEach((item) => {
      addToCart({
        productId: item.productId || item.id,
        name: item.name,
        price: item.price,
        mrp: item.price,
        image: item.image,
        size: item.size || "M",
        color: item.color || "Default",
        quantity: item.quantity,
      });
    });
    setReordered(true);
    setTimeout(() => setReordered(false), 2000);
  };

  const estimatedDelivery = order ? getEstimatedDelivery(order.status, order.createdAt) : null;
  const completedCount = trackingSteps.filter((s) => s.completed).length;
  const totalItemCount = order ? order.items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-[#F8F8F6] pt-4 pb-16"
    >
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button suppressHydrationWarning
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <AnimatePresence mode="wait">
          {!order ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Centered Package Icon */}
              <motion.div
                className="flex flex-col items-center mt-8 sm:mt-16 mb-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#F0EFED] flex items-center justify-center mb-6">
                  <Package className="w-10 h-10 sm:w-14 sm:h-14 text-[#E8E8E8]" strokeWidth={1.5} />
                </div>
                <h1 className="text-[24px] sm:text-[32px] font-medium tracking-[-0.02em] mb-2 text-center">
                  Track Your Order
                </h1>
                <p className="text-[14px] text-[#999] text-center max-w-[320px] leading-relaxed">
                  Enter your order number to see the latest updates
                </p>
              </motion.div>

              {/* Search Input */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.25 }}
                className="max-w-[480px] mx-auto"
              >
                <div className="flex gap-3 mb-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" strokeWidth={1.5} />
                    <input suppressHydrationWarning
                      type="text"
                      value={orderInput}
                      onChange={(e) => setOrderInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                      placeholder="Enter order number (e.g., MSN-XXXXXX)"
                      className="w-full pl-10 pr-4 py-3.5 border border-[#E8E8E8] border-l-[3px] border-l-transparent bg-white text-[14px] outline-none focus:border-[#E8E8E8] focus:border-l-[#4D5B47] transition-all placeholder:text-[#D1D1D1]"
                    />
                  </div>
                  <button suppressHydrationWarning
                    onClick={handleTrack}
                    disabled={loading}
                    className="px-6 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? "Tracking..." : "Track"}
                  </button>
                </div>
                {error && (
                  <p className="text-[13px] text-[#C53030] mt-2">{error}</p>
                )}
              </motion.div>
            </motion.div>
          ) : (
            /* Tracking Result */
            <motion.div
              key="tracking"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Order Info Header */}
              <ScrollReveal>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-[#E8E8E8] mb-8">
                  <div>
                    <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-1">Order Number</p>
                    <p className="text-[18px] font-medium">{order.orderNumber}</p>
                  </div>
                  <div className="mt-3 sm:mt-0 flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${order.status === "delivered" ? "bg-[#4D5B47]" : order.status === "cancelled" ? "bg-[#C53030]" : "bg-[#4D5B47] animate-pulse"}`} />
                    <span className={`text-[13px] font-medium ${order.status === "delivered" ? "text-[#4D5B47]" : order.status === "cancelled" ? "text-[#C53030]" : "text-[#4D5B47]"}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              </ScrollReveal>

              {/* Horizontal Visual Package Tracker */}
              <ScrollReveal delay={0.1}>
                <div className="bg-white border border-[#E8E8E8] p-6 sm:p-8 mb-4">
                  <h2 className="text-[16px] font-medium mb-8">Delivery Timeline</h2>

                  {/* Progress Bar */}
                  <div className="relative px-4 sm:px-2">
                    <div className="absolute top-[20px] left-[calc(10%+10px)] right-[calc(10%+10px)] sm:left-[calc(10%+14px)] sm:right-[calc(10%+14px)] h-[3px] bg-[#E8E8E8]" />
                    <motion.div
                      className="absolute top-[20px] left-[calc(10%+10px)] sm:left-[calc(10%+14px)] h-[3px] bg-[#4D5B47]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(completedCount / (trackingSteps.length - 1)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                      style={{ maxWidth: "calc(80% - 20px)" }}
                    />

                    <div className="relative flex justify-between">
                      {trackingSteps.map((step, i) => {
                        const Icon = stepIcons[i] || Package;
                        const isCompleted = step.completed;
                        const isCurrent = step.current;

                        return (
                          <motion.div
                            key={step.label}
                            className="flex flex-col items-center"
                            style={{ width: "20%" }}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.1, duration: 0.3 }}
                          >
                            <div className="relative mb-3">
                              {isCurrent && (
                                <motion.div
                                  className="absolute inset-[-6px] rounded-full border-2 border-[#4D5B47]/40"
                                  animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                />
                              )}

                              <motion.div
                                className={`w-[40px] h-[40px] sm:w-[44px] sm:h-[44px] rounded-full flex items-center justify-center relative z-10 transition-colors duration-300 ${
                                  isCompleted
                                    ? "bg-[#4D5B47]"
                                    : isCurrent
                                    ? "bg-white border-2 border-[#4D5B47]"
                                    : "bg-[#E8E8E8]"
                                }`}
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3 + i * 0.1, type: "spring", stiffness: 200 }}
                              >
                                {isCompleted ? (
                                  <Check className="w-4 h-4 sm:w-[18px] sm:h-[18px] text-white" strokeWidth={2.5} />
                                ) : (
                                  <Icon className={`w-[18px] h-[18px] sm:w-5 sm:h-5 ${isCurrent ? "text-[#4D5B47]" : "text-[#999]"}`} strokeWidth={1.5} />
                                )}
                              </motion.div>
                            </div>

                            <p className={`text-[11px] sm:text-[12px] font-medium tracking-wide text-center leading-tight ${
                              isCompleted || isCurrent ? "text-[#111]" : "text-[#999]"
                            }`}>
                              {step.label}
                            </p>

                            {step.date && (
                              <p className="text-[10px] sm:text-[11px] text-[#999] mt-0.5 text-center">
                                {step.date}
                              </p>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Estimated Delivery */}
              <AnimatePresence>
                {estimatedDelivery && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                    className="overflow-hidden mb-8"
                  >
                    <div className="bg-[#4D5B47]/[0.06] border border-[#4D5B47]/20 px-5 py-3.5 flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#4D5B47] flex-shrink-0" strokeWidth={1.5} />
                      <span className="text-[13px] text-[#111]">
                        <span className="font-medium">Estimated Delivery:</span>{" "}
                        {estimatedDelivery}
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Order Summary Card */}
              <ScrollReveal delay={0.2}>
                <div className="bg-white border border-[#E8E8E8] p-5 mb-6">
                  <h3 className="text-[13px] font-medium tracking-wider uppercase text-[#999] mb-4">Order Summary</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-[11px] text-[#999] tracking-wide mb-0.5">Order Number</p>
                      <p className="text-[14px] font-medium">{order.orderNumber}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#999] tracking-wide mb-0.5">Order Date</p>
                      <p className="text-[14px] font-medium">{new Date(order.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#999] tracking-wide mb-0.5">Items</p>
                      <p className="text-[14px] font-medium">{totalItemCount} {totalItemCount === 1 ? "item" : "items"}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#999] tracking-wide mb-0.5">Total</p>
                      <p className="text-[14px] font-medium">{"\u20B9"}{order.total.toLocaleString("en-IN")}</p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>

              {/* Item Cards */}
              <ScrollReveal delay={0.25}>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[13px] font-medium tracking-wider uppercase text-[#999]">Items Ordered</h3>
                    <motion.button suppressHydrationWarning
                      onClick={handleReorder}
                      className="flex items-center gap-1.5 px-4 py-2 border border-[#E8E8E8] text-[12px] font-medium tracking-wide uppercase hover:border-[#4D5B47] hover:text-[#4D5B47] transition-colors"
                      whileTap={{ scale: 0.97 }}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {reordered ? "Added!" : "Reorder"}
                    </motion.button>
                  </div>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                        className="flex gap-4 p-3 bg-white border border-[#E8E8E8] hover:border-[#D1D1D1] transition-colors"
                      >
                        <div className="w-16 h-20 sm:w-20 sm:h-24 bg-[#F0EFED] relative overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="absolute inset-0 w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                          <div>
                            <p className="text-[14px] text-[#111] font-medium line-clamp-1">{item.name}</p>
                            <p className="text-[12px] text-[#999] mt-0.5">
                              {item.size} / {item.color}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[12px] text-[#999]">Qty: {item.quantity}</span>
                            <p className="text-[14px] font-medium">{"\u20B9"}{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </ScrollReveal>

              {/* Shipping & Payment */}
              <div className="grid md:grid-cols-2 gap-6">
                <ScrollReveal delay={0.3}>
                  <div className="bg-white border border-[#E8E8E8] p-5">
                    <h3 className="text-[13px] font-medium tracking-wider uppercase text-[#999] mb-3">Shipping Address</h3>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#999] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        {order.shippingAddress ? (
                          <>
                            <p className="text-[13px] text-[#111] font-medium">{order.shippingAddress.name}</p>
                            <p className="text-[13px] text-[#666]">{order.shippingAddress.address}</p>
                            <p className="text-[13px] text-[#666]">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zipCode}</p>
                            <p className="text-[13px] text-[#666]">{order.shippingAddress.phone}</p>
                          </>
                        ) : (
                          <p className="text-[13px] text-[#999]">No shipping address</p>
                        )}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={0.35}>
                  <div className="bg-white border border-[#E8E8E8] p-5">
                    <h3 className="text-[13px] font-medium tracking-wider uppercase text-[#999] mb-3">Payment</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F0EFED] flex items-center justify-center">
                        <span className="text-[11px] font-medium text-[#666]">{"\u20B9"}</span>
                      </div>
                      <div>
                        <p className="text-[13px] text-[#111]">{order.paymentMethod}</p>
                        <p className="text-[11px] text-[#999]">Payment {order.paymentStatus === "completed" ? "completed" : order.paymentStatus}</p>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Detailed Timeline (vertical) */}
              <ScrollReveal delay={0.4}>
                <div className="mt-8 bg-white border border-[#E8E8E8] p-6 sm:p-8">
                  <h2 className="text-[16px] font-medium mb-6">Activity Log</h2>
                  <div className="relative">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[#E8E8E8]" />
                    <div
                      className="absolute left-[15px] top-2 w-px bg-[#111] transition-all duration-700"
                      style={{ height: `${(completedCount / (trackingSteps.length - 1)) * 100}%` }}
                    />

                    <div className="space-y-0">
                      {trackingSteps.map((step, i) => (
                        <motion.div
                          key={step.label}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.1, duration: 0.3 }}
                          className="relative flex gap-5 pb-8 last:pb-0"
                        >
                          <div className="relative z-10 flex-shrink-0">
                            <div
                              className={`w-[32px] h-[32px] rounded-full flex items-center justify-center border-2 transition-colors ${
                                step.current
                                  ? "border-[#4D5B47] bg-[#4D5B47]/10"
                                  : step.completed
                                  ? "border-[#111] bg-[#111]"
                                  : "border-[#E8E8E8] bg-[#F8F8F6]"
                              }`}
                            >
                              {step.completed && !step.current && (
                                <CheckCircle className="w-4 h-4 text-[#F8F8F6]" />
                              )}
                              {step.current && (
                                <div className="w-2.5 h-2.5 bg-[#4D5B47] rounded-full animate-pulse" />
                              )}
                            </div>
                          </div>

                          <div className="flex-1 pt-0.5">
                            <div className="flex items-center gap-3 mb-0.5">
                              <h3 className={`text-[14px] font-medium ${
                                step.completed || step.current ? "text-[#111]" : "text-[#999]"
                              }`}>
                                {step.label}
                              </h3>
                              {step.date && (
                                <span className="text-[12px] text-[#999]">{step.date} {step.time}</span>
                              )}
                            </div>
                            <p className={`text-[13px] ${
                              step.completed || step.current ? "text-[#666]" : "text-[#D1D1D1]"
                            }`}>
                              {step.description}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.main>
  );
}
