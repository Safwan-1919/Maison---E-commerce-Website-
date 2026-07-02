"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  Minus, Plus, X, ShoppingBag, ArrowRight, Truck, RotateCcw, Shield,
  ChevronRight, Tag
} from "lucide-react";
import Image from "next/image";

export default function CartPage() {
  const {
    cartItems, updateCartQuantity, removeFromCart, clearCart,
    getCartTotal, getCartMrpTotal, getCartCount, navigate, setCartOpen
  } = useStore();
  const [couponCode, setCouponCode] = useState("");
  const [couponApplied, setCouponApplied] = useState<{ code: string; discount: number; type: string } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const total = getCartTotal();
  const mrpTotal = getCartMrpTotal();
  const savings = mrpTotal - total;
  const itemCount = getCartCount();
  const freeShipping = total >= 2000;
  const shippingCost = freeShipping ? 0 : 149;
  const couponDiscount = couponApplied
    ? couponApplied.type === "percent"
      ? Math.min((total * couponApplied.discount) / 100, total)
      : Math.min(couponApplied.discount, total)
    : 0;
  const finalTotal = total - couponDiscount + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplyingCoupon(true);
    setCouponError("");
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode }),
      });
      const data = await res.json();
      if (data.valid) {
        if (data.minOrder && total < data.minOrder) {
          setCouponError(`Minimum order of ₹${data.minOrder.toLocaleString("en-IN")} required`);
        } else {
          setCouponApplied({ code: couponCode.toUpperCase(), discount: data.discount, type: data.type });
        }
      } else {
        setCouponError(data.message || "Invalid coupon");
      }
    } catch {
      setCouponError("Failed to apply coupon");
    }
    setApplyingCoupon(false);
  };

  const removeCoupon = () => {
    setCouponApplied(null);
    setCouponCode("");
    setCouponError("");
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex flex-col items-center justify-center text-center py-24">
            <ShoppingBag className="w-16 h-16 text-[#D1D1D1] mb-6" strokeWidth={1} />
            <h1 className="text-[28px] font-medium tracking-[-0.02em] mb-2">Your bag is empty</h1>
            <p className="text-[14px] text-[#999] mb-8">Looks like you haven&apos;t added anything yet</p>
            <button
              onClick={() => navigate("shop")}
              className="px-8 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8F8F6] pt-20 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-4 text-[12px] text-[#999]">
          <button onClick={() => navigate("home")} className="hover:text-[#111] transition-colors">Home</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#111]">Shopping Bag</span>
        </nav>

        <h1 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em] mb-2">Shopping Bag</h1>
        <p className="text-[14px] text-[#999] mb-8">{itemCount} item{itemCount !== 1 ? "s" : ""}</p>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Cart Items */}
          <div className="flex-1 min-w-0">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -40, height: 0, marginBottom: 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex gap-4 sm:gap-6 py-6 border-b border-[#E8E8E8]"
                >
                  {/* Image */}
                  <button
                    onClick={() => navigate("product", item.productId)}
                    className="w-24 h-32 sm:w-28 sm:h-36 bg-[#F0EFED] flex-shrink-0 relative overflow-hidden"
                  >
                    <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
                  </button>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-1">
                        {item.size} / {item.color}
                      </p>
                      <h3 className="text-[14px] sm:text-[15px] font-normal text-[#111] mb-1 line-clamp-1">{item.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[14px] font-medium">{"\u20B9"}{item.price.toLocaleString("en-IN")}</span>
                        {item.mrp > item.price && (
                          <span className="text-[12px] text-[#999] line-through">
                            {"\u20B9"}{item.mrp.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center border border-[#E8E8E8]">
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F0EFED] transition-colors"
                        >
                          <Minus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                        <span className="w-10 text-center text-[13px] font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center hover:bg-[#F0EFED] transition-colors"
                        >
                          <Plus className="w-3 h-3" strokeWidth={1.5} />
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[14px] font-medium">{"\u20B9"}{(item.price * item.quantity).toLocaleString("en-IN")}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[11px] text-[#999] hover:text-[#C53030] transition-colors tracking-wide uppercase flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {cartItems.length > 1 && (
              <button
                onClick={clearCart}
                className="mt-6 text-[12px] text-[#999] hover:text-[#C53030] transition-colors tracking-wide uppercase"
              >
                Clear Entire Bag
              </button>
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:w-[380px] flex-shrink-0">
            <div className="sticky top-[88px] bg-white border border-[#E8E8E8] p-6">
              <h2 className="text-[15px] font-medium tracking-wide mb-6">Order Summary</h2>

              {/* Coupon */}
              <div className="mb-6">
                {couponApplied ? (
                  <div className="flex items-center justify-between p-3 bg-[#F0EFED]">
                    <div className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-[#4D5B47]" />
                      <span className="text-[12px] font-medium text-[#111]">{couponApplied.code}</span>
                      <span className="text-[12px] text-[#4D5B47]">
                        -{"\u20B9"}{Math.round(couponDiscount).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <button onClick={removeCoupon} className="text-[#999] hover:text-[#111]">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponCode}
                      onChange={(e) => { setCouponCode(e.target.value); setCouponError(""); }}
                      placeholder="Coupon code"
                      className="flex-1 px-3 py-2.5 border border-[#E8E8E8] text-[13px] outline-none focus:border-[#4D5B47] transition-colors placeholder:text-[#D1D1D1]"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      disabled={applyingCoupon}
                      className="px-4 py-2.5 border border-[#111] text-[11px] font-medium tracking-widest uppercase hover:bg-[#111] hover:text-[#F8F8F6] transition-all disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {couponError && <p className="text-[11px] text-[#C53030] mt-1.5">{couponError}</p>}
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 pb-6 border-b border-[#E8E8E8]">
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#666]">Subtotal (MRP)</span>
                  <span className="text-[#999] line-through">{"\u20B9"}{mrpTotal.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#666]">Product Discount</span>
                  <span className="text-[#4D5B47] font-medium">-{"\u20B9"}{savings.toLocaleString("en-IN")}</span>
                </div>
                {couponApplied && (
                  <div className="flex justify-between text-[13px]">
                    <span className="text-[#666]">Coupon ({couponApplied.code})</span>
                    <span className="text-[#4D5B47] font-medium">-{"\u20B9"}{Math.round(couponDiscount).toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#666]">Shipping</span>
                  <span className={freeShipping ? "text-[#4D5B47] font-medium" : "text-[#111]"}>
                    {freeShipping ? "FREE" : "\u20B9149"}
                  </span>
                </div>
              </div>

              {!freeShipping && (
                <div className="py-4 border-b border-[#E8E8E8]">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] text-[#999]">Add {"\u20B9"}{(2000 - total).toLocaleString("en-IN")} more for free shipping</span>
                  </div>
                  <div className="h-1 bg-[#F0EFED]">
                    <div className="h-full bg-[#111] transition-all duration-500" style={{ width: `${Math.min((total / 2000) * 100, 100)}%` }} />
                  </div>
                </div>
              )}

              <div className="flex justify-between py-4">
                <span className="text-[16px] font-medium">Total</span>
                <span className="text-[16px] font-medium">{"\u20B9"}{Math.round(finalTotal).toLocaleString("en-IN")}</span>
              </div>

              <button
                onClick={() => navigate("checkout")}
                className="w-full py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors flex items-center justify-center gap-2 mb-3"
              >
                Proceed to Checkout <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => navigate("shop")}
                className="w-full py-3 text-[12px] tracking-[0.15em] uppercase text-[#666] hover:text-[#111] transition-colors"
              >
                Continue Shopping
              </button>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[#E8E8E8]">
                <div className="flex flex-col items-center gap-1">
                  <Shield className="w-4 h-4 text-[#999]" strokeWidth={1.5} />
                  <span className="text-[10px] text-[#999]">Secure</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <RotateCcw className="w-4 h-4 text-[#999]" strokeWidth={1.5} />
                  <span className="text-[10px] text-[#999]">Returns</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Truck className="w-4 h-4 text-[#999]" strokeWidth={1.5} />
                  <span className="text-[10px] text-[#999]">Free Ship</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}