"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { FREE_SHIPPING_THRESHOLD, SHIPPING_COST } from "@/lib/constants";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  ChevronRight, CreditCard, Wallet, Building2, Smartphone, Truck,
  CheckCircle, ArrowLeft, Shield, Lock, User, Tag, X, MapPin
} from "lucide-react";

const steps = ["Shipping", "Payment", "Review"];

function StepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-center mb-10">
      {steps.map((step, i) => (
        <div key={step} className="flex items-center">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 flex items-center justify-center text-[12px] font-medium transition-colors ${
                i <= currentStep
                  ? "bg-[#111] text-[#F8F8F6]"
                  : "bg-[#F0EFED] text-[#999]"
              }`}
            >
              {i < currentStep ? <CheckCircle className="w-4 h-4" /> : i + 1}
            </div>
            <span className={`text-[12px] tracking-wider uppercase hidden sm:inline ${
              i <= currentStep ? "text-[#111] font-medium" : "text-[#999]"
            }`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className="w-12 sm:w-20 h-px mx-3 relative overflow-hidden bg-[#E8E8E8]">
              <motion.div
                initial={false}
                animate={{ width: i < currentStep ? "100%" : "0%" }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="absolute inset-y-0 left-0 bg-[#4D5B47]"
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

interface SavedAddress {
  fullName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  phone?: string;
  [key: string]: string | undefined;
}

function InputField({ label, name, value, onChange, type = "text", placeholder, required = true }: {
  label: string; name: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="block text-[11px] font-medium tracking-wider uppercase text-[#999] mb-1.5">
        {label} {required && <span className="text-[#C53030]">*</span>}
      </label>
      <input suppressHydrationWarning
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-[#E8E8E8] text-[14px] outline-none focus:border-[#111] transition-colors bg-white placeholder:text-[#D1D1D1]"
      />
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems, getCartTotal, getCartMrpTotal, getCartCount, navigate, clearCart, showNotification, setAuthOpen } = useStore();
  const { isAuthenticated: authed, user } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(authed);
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const [orderTotal, setOrderTotal] = useState(0);
  const [orderError, setOrderError] = useState("");

  const [shipping, setShipping] = useState({
    fullName: "", email: "", phone: "",
    address1: "", address2: "", city: "", state: "", pincode: "", country: "India",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upiId, setUpiId] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showMobileSummary, setShowMobileSummary] = useState(false);

  // Coupon
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");

  // Saved addresses from API
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressIdx, setSelectedAddressIdx] = useState<number | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [dynamicPaymentMethods, setDynamicPaymentMethods] = useState<{ id: string; label: string; icon: string; brand: string }[]>([]);

  const total = getCartTotal();
  const mrpTotal = getCartMrpTotal();
  const shippingCost = total >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const finalTotal = Math.max(0, total + shippingCost - couponDiscount);

  // Fetch user profile for saved addresses
  useEffect(() => {
    if (!isAuthenticated) return;
    setLoadingProfile(true);

    const fetchProfile = fetch("/api/user").then((r) => r.json());
    const fetchContent = fetch("/api/site-content").then((r) => r.json());

    Promise.all([fetchProfile, fetchContent])
      .then(([userData, contentData]) => {
        if (userData.addresses) {
          try {
            const parsed: SavedAddress[] = JSON.parse(userData.addresses);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setSavedAddresses(parsed);
              const addr = parsed[0];
              setShipping((prev) => ({
                ...prev,
                fullName: addr.fullName || prev.fullName || userData.name || user?.name || "",
                phone: addr.phone || prev.phone || userData.phone || "",
                address1: addr.address1 || addr.street || prev.address1,
                address2: addr.address2 || prev.address2,
                city: addr.city || prev.city,
                state: addr.state || prev.state,
                pincode: addr.pincode || addr.zip || prev.pincode,
                email: userData.email || user?.email || prev.email,
              }));
              setSelectedAddressIdx(0);
            } else {
              setShipping((prev) => ({
                ...prev,
                email: userData.email || user?.email || prev.email,
                fullName: prev.fullName || userData.name || user?.name || "",
                phone: prev.phone || userData.phone || "",
              }));
            }
          } catch {
            setShipping((prev) => ({
              ...prev,
              email: userData.email || user?.email || prev.email,
              fullName: prev.fullName || userData.name || user?.name || "",
              phone: prev.phone || userData.phone || "",
            }));
          }
        }

        try {
          if (contentData.content?.paymentMethods) {
            const parsed = JSON.parse(contentData.content.paymentMethods);
            if (Array.isArray(parsed)) setDynamicPaymentMethods(parsed);
          }
        } catch {}
      })
      .catch(() => {})
      .finally(() => setLoadingProfile(false));
  }, [isAuthenticated, user]);

  const defaultPaymentMethods = [
    { id: "card", label: "Credit / Debit Card", icon: "CreditCard", brand: "Visa, Mastercard, RuPay" },
    { id: "upi", label: "UPI", icon: "Smartphone", brand: "GPay, PhonePe, Paytm" },
    { id: "netbanking", label: "Net Banking", icon: "Building2", brand: "All major banks" },
    { id: "wallet", label: "Wallet", icon: "Wallet", brand: "Paytm, Amazon Pay" },
    { id: "cod", label: "Cash on Delivery", icon: "Truck", brand: "Pay on delivery" },
  ];

  const paymentMethodsData = dynamicPaymentMethods.length > 0 ? dynamicPaymentMethods : defaultPaymentMethods;

  // Map icon strings to actual Lucide components
  const iconMap: Record<string, typeof CreditCard> = { CreditCard, Smartphone, Building2, Wallet, Truck };

  const paymentMethods = paymentMethodsData.map((pm) => ({
    ...pm,
    icon: iconMap[pm.icon] || CreditCard,
  }));

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponMessage("");
    setCouponDiscount(0);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim(), orderTotal: total }),
      });
      const data = await res.json();
      if (data.valid) {
        const discountAmt = data.discount || 0;
        setCouponDiscount(discountAmt);
        setAppliedCoupon(couponCode.trim());
        setCouponMessage(`Coupon applied! You save ₹${discountAmt.toLocaleString("en-IN")}`);
      } else {
        setCouponMessage(data.message || "Invalid coupon code");
        setAppliedCoupon("");
      }
    } catch {
      setCouponMessage("Failed to validate coupon");
    }
    setCouponLoading(false);
  };

  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponDiscount(0);
    setCouponMessage("");
    setAppliedCoupon("");
  };

  const handleSelectAddress = (idx: number) => {
    setSelectedAddressIdx(idx);
    const addr = savedAddresses[idx];
    setShipping((prev) => ({
      ...prev,
      fullName: addr.fullName || prev.fullName,
      phone: addr.phone || prev.phone,
      address1: addr.address1 || addr.street || prev.address1,
      address2: addr.address2 || prev.address2,
      city: addr.city || prev.city,
      state: addr.state || prev.state,
      pincode: addr.pincode || addr.zip || prev.pincode,
    }));
  };

  const handlePlaceOrder = async () => {
    if (!agreed) return;
    setPlacing(true);
    setOrderError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cartItems.map((item) => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            size: item.size,
            color: item.color,
            image: item.image,
          })),
          shippingAddress: shipping,
          paymentMethod,
          couponCode: appliedCoupon || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderNumber(data.order.orderNumber);
        setOrderTotal(data.order.total);
        setOrderSuccess(true);
        clearCart();
      } else {
        setOrderError(data.error || "Failed to place order. Please try again.");
      }
    } catch (e) {
      setOrderError("Something went wrong. Please try again.");
    }
    setPlacing(false);
  };

  // Auth guard — allow guest checkout
  if (!isAuthenticated) {
    return (
      <motion.main
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
          <h2 className="text-[22px] font-medium tracking-[-0.02em] mb-2">Checkout</h2>
          <p className="text-[14px] text-[#666] mb-8">
            Sign in for a faster experience, or continue as a guest.
          </p>
          <div className="space-y-3">
            <button suppressHydrationWarning
              onClick={() => setAuthOpen(true)}
              className="w-full px-8 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors"
            >
              Sign In
            </button>
            <button suppressHydrationWarning
              onClick={() => setIsAuthenticated(true)}
              className="w-full px-8 py-3.5 border border-[#E8E8E8] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#F0EFED] transition-colors"
            >
              Continue as Guest
            </button>
          </div>
          <button suppressHydrationWarning
            onClick={() => navigate("shop")}
            className="block mx-auto mt-4 text-[12px] text-[#999] hover:text-[#111] transition-colors tracking-wider uppercase"
          >
            Continue Shopping
          </button>
        </motion.div>
      </motion.main>
    );
  }

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="min-h-screen bg-[#F8F8F6] pt-4 flex items-center justify-center"
      >
        <div className="text-center">
          <p className="text-[15px] text-[#666] mb-4">Your bag is empty</p>
          <button suppressHydrationWarning onClick={() => navigate("shop")} className="px-6 py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase">
            Shop Now
          </button>
        </div>
      </motion.main>
    );
  }

  if (orderSuccess) {
    const deliveryMin = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const deliveryMax = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const confettiParticles = Array.from({ length: 14 }, (_, i) => {
      const angle = (i / 14) * Math.PI * 2 + (Math.random() - 0.5) * 0.4;
      const distance = 120 + Math.random() * 140;
      const size = 6 + Math.random() * 8;
      const colors = ["#4D5B47", "#B79B7B", "#111", "#E8E8E8", "#6B8F5E", "#D4A853"];
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 40,
        size,
        color: colors[i % colors.length],
        delay: 0.3 + Math.random() * 0.3,
      };
    });

    const fmtDate = (d: Date) =>
      d.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });

    return (
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="min-h-screen bg-[#F8F8F6] pt-4 flex items-center justify-center relative overflow-hidden"
      >
        {/* Confetti particles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {confettiParticles.map((p) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, scale: [0, 1, 1, 0] }}
              transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
              className="absolute rounded-full"
              style={{ width: p.size, height: p.size, backgroundColor: p.color }}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto px-4 relative z-10"
        >
          {/* Large animated checkmark circle */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.15, type: "spring", damping: 12, stiffness: 180 }}
            className="w-24 h-24 bg-[#4D5B47] rounded-full flex items-center justify-center mx-auto mb-8"
          >
            <motion.svg
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
              width="44"
              height="44"
              viewBox="0 0 44 44"
              fill="none"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <motion.path
                d="M10 22 L19 31 L34 13"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.45, duration: 0.5, ease: "easeOut" }}
              />
            </motion.svg>
          </motion.div>

          <h1 className="text-[26px] sm:text-[30px] font-medium tracking-[-0.02em] mb-2">
            Thank you for your order
          </h1>
          <p className="text-[14px] text-[#666] mb-8">
            Your order has been placed successfully and is being processed.
          </p>

          {/* Order number card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="bg-white border border-[#E8E8E8] rounded-[4px] p-5 mb-4 text-left"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-medium tracking-wider uppercase text-[#999]">
                Order Number
              </span>
              <span className="text-[12px] font-medium text-[#4D5B47]">Confirmed</span>
            </div>
            <p className="text-[18px] font-medium tracking-[-0.01em]">#{orderNumber}</p>
            <div className="mt-3 pt-3 border-t border-[#E8E8E8]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#999]">Estimated Delivery</span>
                <span className="text-[13px] font-medium">
                  {fmtDate(deliveryMin)} – {fmtDate(deliveryMax)}
                </span>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-[#E8E8E8]">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-[#999]">Order Total</span>
                <span className="text-[16px] font-medium">
                  {"\u20B9"}{orderTotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </motion.div>

          {/* Delivery info */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.4 }}
            className="flex items-center justify-center gap-2 mb-8"
          >
            <Truck className="w-4 h-4 text-[#4D5B47]" strokeWidth={1.5} />
            <span className="text-[12px] text-[#999]">
              A confirmation email has been sent to your email address
            </span>
          </motion.div>

          {/* Action buttons */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.4 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <button suppressHydrationWarning
              onClick={() => navigate("home")}
              className="flex-1 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors"
            >
              Continue Shopping
            </button>
            <button suppressHydrationWarning
              onClick={() => navigate("order-tracking")}
              className="flex-1 py-3.5 border border-[#E8E8E8] text-[#111] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#F0EFED] transition-colors flex items-center justify-center gap-2"
            >
              <Truck className="w-4 h-4" strokeWidth={1.5} />
              Track Order
            </button>
          </motion.div>
        </motion.div>
      </motion.main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-[#F8F8F6] pt-4 pb-16"
    >
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
        <StepIndicator currentStep={step} />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Form */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-[20px] font-medium tracking-[-0.01em] mb-6">Shipping Address</h2>

                  {/* Mobile Order Summary Toggle */}
                  <div className="lg:hidden mb-6">
                    <button suppressHydrationWarning
                      onClick={() => setShowMobileSummary(!showMobileSummary)}
                      className="w-full flex items-center justify-between py-3 border-b border-[#E8E8E8]"
                    >
                      <span className="text-[13px] font-medium">Order Summary ({cartItems.length} items)</span>
                      <span className="text-[14px] font-medium">₹{finalTotal.toLocaleString("en-IN")}</span>
                    </button>
                    <AnimatePresence>
                      {showMobileSummary && (
                        <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                          <div className="py-3 space-y-3">
                            {cartItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-3">
                                <div className="w-10 h-12 bg-[#F0EFED] relative overflow-hidden flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] text-[#111] line-clamp-1">{item.name}</p>
                                  <p className="text-[11px] text-[#999]">{item.size}{item.color ? ` / ${item.color}` : ""} × {item.quantity}</p>
                                </div>
                                <span className="text-[12px] font-medium">{"\u20B9"}{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Saved addresses selector */}
                  {savedAddresses.length > 1 && (
                    <div className="mb-6">
                      <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">Saved Addresses</p>
                      <div className="space-y-2">
                        {savedAddresses.map((addr, idx) => (
                          <button suppressHydrationWarning
                            key={idx}
                            onClick={() => handleSelectAddress(idx)}
                            className={`w-full text-left p-3 border transition-colors rounded-[4px] ${
                              selectedAddressIdx === idx
                                ? "border-[#111] bg-[#FAFAF8]"
                                : "border-[#E8E8E8] hover:border-[#999]"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-[#4D5B47] flex-shrink-0" strokeWidth={1.5} />
                              <p className="text-[13px] text-[#111] line-clamp-1">
                                {addr.address1 || addr.street}{addr.city ? `, ${addr.city}` : ""}
                              </p>
                            </div>
                          </button>
                        ))}
                        <button suppressHydrationWarning
                          onClick={() => {
                            setSelectedAddressIdx(null);
                            setShipping({
                              fullName: user?.name || "", email: user?.email || "", phone: "",
                              address1: "", address2: "", city: "", state: "", pincode: "", country: "India",
                              notes: "",
                            });
                          }}
                          className="w-full text-left p-3 border border-dashed border-[#E8E8E8] text-[12px] text-[#666] hover:text-[#111] hover:border-[#999] transition-colors rounded-[4px]"
                        >
                          + Enter a new address
                        </button>
                      </div>
                    </div>
                  )}

                  {loadingProfile ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 skeleton-shimmer rounded-[4px]" />
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <InputField label="Full Name" name="fullName" value={shipping.fullName} onChange={(v) => setShipping({ ...shipping, fullName: v })} placeholder="John Doe" />
                        <InputField label="Email" name="email" value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} type="email" placeholder="john@example.com" />
                      </div>
                      <InputField label="Phone" name="phone" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} type="tel" placeholder="+91 98765 43210" />
                      <InputField label="Address Line 1" name="address1" value={shipping.address1} onChange={(v) => setShipping({ ...shipping, address1: v })} placeholder="Street address, apartment, suite" />
                      <InputField label="Address Line 2" name="address2" value={shipping.address2} onChange={(v) => setShipping({ ...shipping, address2: v })} placeholder="Optional" required={false} />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <InputField label="City" name="city" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                        <InputField label="State" name="state" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} />
                        <InputField label="Pincode" name="pincode" value={shipping.pincode} onChange={(v) => setShipping({ ...shipping, pincode: v })} />
                      </div>

                      {/* Order Notes */}
                      <div>
                        <label className="block text-[11px] font-medium tracking-wider uppercase text-[#999] mb-1.5">
                          Order Notes <span className="text-[#999] font-normal normal-case tracking-normal">(optional)</span>
                        </label>
                        <textarea
                          suppressHydrationWarning
                          value={shipping.notes}
                          onChange={(e) => setShipping({ ...shipping, notes: e.target.value })}
                          placeholder="Special delivery instructions, e.g. leave at the door, ring the bell twice..."
                          rows={3}
                          className="w-full px-3 py-2.5 border border-[#E8E8E8] text-[14px] outline-none focus:border-[#111] transition-colors bg-white placeholder:text-[#D1D1D1] resize-none"
                        />
                      </div>
                    </div>
                  )}
                  <button suppressHydrationWarning
                    onClick={() => setStep(1)}
                    disabled={!shipping.fullName || !shipping.email || !shipping.phone || !shipping.address1 || !shipping.city || !shipping.pincode}
                    className="mt-8 w-full py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    Continue to Payment <ChevronRight className="w-4 h-4" />
                  </button>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="payment" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-[20px] font-medium tracking-[-0.01em] mb-6">Payment Method</h2>

                  {/* Coupon Code */}
                  <div className="mb-6">
                    <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">Coupon Code</p>
                    {appliedCoupon ? (
                      <div className="flex items-center gap-2 p-3 bg-[#4D5B47]/5 border border-[#4D5B47]/20 rounded-[4px]">
                        <Tag className="w-4 h-4 text-[#4D5B47]" strokeWidth={1.5} />
                        <span className="text-[13px] text-[#4D5B47] font-medium flex-1">{appliedCoupon}</span>
                        <span className="text-[13px] text-[#4D5B47]">-₹{couponDiscount.toLocaleString("en-IN")}</span>
                        <button suppressHydrationWarning onClick={handleRemoveCoupon} className="text-[#999] hover:text-[#111]">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <input suppressHydrationWarning
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="flex-1 px-3 py-2.5 border border-[#E8E8E8] text-[13px] uppercase outline-none focus:border-[#111] transition-colors bg-white placeholder:text-[#D1D1D1] placeholder:normal-case"
                          onKeyDown={(e) => e.key === "Enter" && handleApplyCoupon()}
                        />
                        <button suppressHydrationWarning
                          onClick={handleApplyCoupon}
                          disabled={couponLoading || !couponCode.trim()}
                          className="px-5 py-2.5 border border-[#111] text-[12px] font-medium tracking-wider uppercase text-[#111] hover:bg-[#111] hover:text-[#F8F8F6] transition-colors disabled:opacity-40"
                        >
                          {couponLoading ? "..." : "Apply"}
                        </button>
                      </div>
                    )}
                    {couponMessage && (
                      <p className={`text-[12px] mt-1.5 ${appliedCoupon ? "text-[#4D5B47]" : "text-[#C53030]"}`}>
                        {couponMessage}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 mb-6">
                    {paymentMethods.map((pm) => (
                      <motion.button suppressHydrationWarning
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        whileTap={{ scale: 0.99 }}
                        className={`w-full flex items-center gap-3 p-4 border-l-2 transition-all text-left ${
                          paymentMethod === pm.id
                            ? "border-l-[#4D5B47] border-y border-r border-[#4D5B47] bg-[#F8FAF7]"
                            : "border-l-transparent border border-[#E8E8E8] hover:border-[#999]"
                        }`}
                      >
                        <pm.icon className={`w-5 h-5 ${paymentMethod === pm.id ? "text-[#4D5B47]" : "text-[#999]"}`} strokeWidth={1.5} />
                        <div className="flex-1 min-w-0">
                          <span className={`text-[14px] block ${paymentMethod === pm.id ? "font-medium text-[#111]" : "text-[#666]"}`}>{pm.label}</span>
                          <span className="text-[11px] text-[#999]">{pm.brand}</span>
                        </div>
                        {paymentMethod === pm.id && <CheckCircle className="w-4 h-4 text-[#4D5B47] flex-shrink-0" />}
                      </motion.button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {paymentMethod === "card" && (
                      <motion.div key="card-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                        <InputField label="Card Number" name="card" value={cardDetails.number} onChange={(v) => setCardDetails({ ...cardDetails, number: v })} placeholder="4242 4242 4242 4242" />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <InputField label="Expiry" name="expiry" value={cardDetails.expiry} onChange={(v) => setCardDetails({ ...cardDetails, expiry: v })} placeholder="MM/YY" />
                          <InputField label="CVV" name="cvv" value={cardDetails.cvv} onChange={(v) => setCardDetails({ ...cardDetails, cvv: v })} placeholder="123" />
                        </div>
                        <InputField label="Name on Card" name="cardName" value={cardDetails.name} onChange={(v) => setCardDetails({ ...cardDetails, name: v })} />
                      </motion.div>
                    )}
                    {paymentMethod === "upi" && (
                      <motion.div key="upi-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <InputField label="UPI ID" name="upi" value={upiId} onChange={setUpiId} placeholder="yourname@upi" />
                      </motion.div>
                    )}
                    {paymentMethod === "cod" && (
                      <motion.div key="cod-info" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="p-4 bg-[#F0EFED] overflow-hidden">
                        <p className="text-[13px] text-[#666]">Pay with cash when your order is delivered. A small handling fee may apply.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="flex gap-3 mt-8">
                    <button suppressHydrationWarning
                      onClick={() => setStep(0)}
                      className="flex-1 py-3.5 border border-[#E8E8E8] text-[12px] tracking-[0.15em] uppercase text-[#666] hover:border-[#999] transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button suppressHydrationWarning
                      onClick={() => setStep(2)}
                      className="flex-[2] py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                    >
                      Review Order <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="review" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-[20px] font-medium tracking-[-0.01em] mb-6">Review Your Order</h2>

                  {orderError && (
                    <div className="mb-4 p-3 bg-[#C53030]/5 border border-[#C53030]/20 rounded-[4px] text-[13px] text-[#C53030]">
                      {orderError}
                    </div>
                  )}

                  {/* Shipping Summary */}
                  <div className="p-4 border border-[#E8E8E8] bg-white mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium tracking-wider uppercase text-[#999]">Shipping Address</span>
                      <button suppressHydrationWarning onClick={() => setStep(0)} className="text-[11px] text-[#4D5B47] hover:text-[#111]">Edit</button>
                    </div>
                    <p className="text-[13px] text-[#111]">{shipping.fullName}</p>
                    <p className="text-[13px] text-[#666]">{shipping.address1}{shipping.address2 ? `, ${shipping.address2}` : ""}</p>
                    <p className="text-[13px] text-[#666]">{shipping.city}, {shipping.state} - {shipping.pincode}</p>
                    <p className="text-[13px] text-[#666]">{shipping.phone} &middot; {shipping.email}</p>
                    {shipping.notes && (
                      <div className="mt-2 pt-2 border-t border-[#E8E8E8]">
                        <span className="text-[11px] text-[#999] uppercase tracking-wider">Notes: </span>
                        <span className="text-[12px] text-[#666]">{shipping.notes}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 border border-[#E8E8E8] bg-white mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium tracking-wider uppercase text-[#999]">Payment Method</span>
                      <button suppressHydrationWarning onClick={() => setStep(1)} className="text-[11px] text-[#4D5B47] hover:text-[#111]">Edit</button>
                    </div>
                    <p className="text-[13px] text-[#111]">{paymentMethods.find((p) => p.id === paymentMethod)?.label}</p>
                  </div>

                  {/* Items */}
                  <div className="border border-[#E8E8E8] bg-white mb-6">
                    <div className="p-4 border-b border-[#E8E8E8]">
                      <span className="text-[11px] font-medium tracking-wider uppercase text-[#999]">
                        Items ({getCartCount()})
                      </span>
                    </div>
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 p-4 border-b border-[#F0EFED] last:border-0">
                        <div className="w-12 h-16 bg-[#F0EFED] relative overflow-hidden flex-shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-[#111] line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-[#999]">{item.size} / {item.color} &middot; Qty: {item.quantity}</p>
                        </div>
                        <span className="text-[13px] font-medium">{"\u20B9"}{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                  </div>

                  {/* Terms */}
                  <label className="flex items-start gap-2.5 mb-6 cursor-pointer">
                    <div
                      className={`w-4 h-4 border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors ${
                        agreed ? "bg-[#111] border-[#111]" : "border-[#D1D1D1]"
                      }`}
                      onClick={() => setAgreed(!agreed)}
                    >
                      {agreed && <CheckCircle className="w-3 h-3 text-[#F8F8F6]" />}
                    </div>
                    <span className="text-[12px] text-[#666] leading-relaxed">
                      I agree to the <button suppressHydrationWarning className="underline text-[#111]">Terms &amp; Conditions</button> and{" "}
                      <button suppressHydrationWarning className="underline text-[#111]">Privacy Policy</button>.
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button suppressHydrationWarning
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 border border-[#E8E8E8] text-[12px] tracking-[0.15em] uppercase text-[#666] hover:border-[#999] transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button suppressHydrationWarning
                      onClick={handlePlaceOrder}
                      disabled={!agreed || placing}
                      className="flex-[2] py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors disabled:opacity-40 flex items-center justify-center gap-2 truncate"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      {placing ? "Placing Order..." : `Place Order \u2022 \u20B9${finalTotal.toLocaleString("en-IN")}`}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Sidebar Summary */}
          <div className="lg:w-[320px] flex-shrink-0">
            <div className="sticky top-[88px] bg-white border border-[#E8E8E8] p-5 rounded-[4px]">
              <h3 className="text-[13px] font-medium tracking-wider uppercase text-[#999] mb-4">Order Summary</h3>
              <div className="space-y-3 pb-4 border-b border-[#E8E8E8]">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#666]">Subtotal</span>
                  <span>{"\u20B9"}{total.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#666]">Discount</span>
                  <span className="text-[#4D5B47]">-{"\u20B9"}{(mrpTotal - total).toLocaleString("en-IN")}</span>
                </div>
                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#666]">Coupon ({appliedCoupon})</span>
                    <span className="text-[#4D5B47]">-{"\u20B9"}{couponDiscount.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#666]">Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-[#4D5B47]">FREE</span> : `\u20B9${SHIPPING_COST}`}</span>
                </div>
              </div>
              <div className="flex justify-between py-4">
                <span className="text-[15px] font-medium">Total</span>
                <span className="text-[15px] font-medium">{"\u20B9"}{finalTotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex items-center gap-2 pt-3 border-t border-[#E8E8E8]">
                <Shield className="w-3.5 h-3.5 text-[#4D5B47]" strokeWidth={1.5} />
                <span className="text-[11px] text-[#999]">256-bit SSL encrypted checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.main>
  );
}