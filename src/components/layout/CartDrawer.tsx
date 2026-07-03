"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus, ShoppingBag, ArrowRight } from "lucide-react";
import { useStore } from "@/lib/store";

export function CartDrawer() {
  const { isCartOpen, setCartOpen, cartItems, updateCartQuantity, removeFromCart, getCartTotal, getCartMrpTotal, getCartCount, navigate } = useStore();

  const total = getCartTotal();
  const mrpTotal = getCartMrpTotal();
  const savings = mrpTotal - total;
  const itemCount = getCartCount();
  const freeShipping = total >= 2000;

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 z-[80]"
            onClick={() => setCartOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full max-w-[440px] bg-[#F8F8F6] z-[90] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E8E8E8]">
              <div className="flex items-center gap-3">
                <h2 className="text-[15px] font-medium tracking-wide">Shopping Bag</h2>
                <span className="text-[12px] text-[#999]">({itemCount} items)</span>
              </div>
              <button
                onClick={() => setCartOpen(false)}
                className="w-9 h-9 flex items-center justify-center hover:opacity-60 transition-opacity"
              >
                <X className="w-5 h-5" strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-[#D1D1D1] mb-4" strokeWidth={1} />
                  <p className="text-[15px] text-[#111] mb-1">Your bag is empty</p>
                  <p className="text-[13px] text-[#999] mb-6">Discover our curated collection</p>
                  <button
                    onClick={() => {
                      setCartOpen(false);
                      navigate("shop");
                    }}
                    className="px-6 py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors"
                  >
                    Shop Now
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: 40 }}
                      className="flex gap-4 pb-4 border-b border-[#E8E8E8]"
                    >
                      <div className="w-20 h-24 bg-[#E8E8E8] flex-shrink-0 relative overflow-hidden">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-0.5">
                          {item.size} / {item.color}
                        </p>
                        <h3 className="text-[13px] text-[#111] line-clamp-1 mb-1">{item.name}</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-[13px] font-medium">₹{item.price.toLocaleString("en-IN")}</span>
                          {item.mrp > item.price && (
                            <span className="text-[11px] text-[#999] line-through">
                              ₹{item.mrp.toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center border border-[#E8E8E8]">
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-[#E8E8E8] transition-colors"
                            >
                              <Minus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                            <span className="w-8 text-center text-[12px] font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-[#E8E8E8] transition-colors"
                            >
                              <Plus className="w-3 h-3" strokeWidth={1.5} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-[11px] text-[#999] hover:text-[#111] transition-colors tracking-wide uppercase"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="border-t border-[#E8E8E8] px-6 py-5 bg-[#F8F8F6]">
                {savings > 0 && (
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[12px] text-[#4D5B47] font-medium">You Save</span>
                    <span className="text-[12px] text-[#4D5B47] font-medium">₹{savings.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {!freeShipping && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-[#999]">Free shipping progress</span>
                      <span className="text-[11px] text-[#999]">₹{(2000 - total).toLocaleString("en-IN")} more</span>
                    </div>
                    <div className="h-1 bg-[#E8E8E8]">
                      <div
                        className="h-full bg-[#111] transition-all duration-500"
                        style={{ width: `${Math.min((total / 2000) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
                {freeShipping && (
                  <p className="text-[11px] text-[#4D5B47] font-medium mb-3">✓ You qualify for free shipping</p>
                )}
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[15px] font-medium">Subtotal</span>
                  <span className="text-[15px] font-medium">₹{total.toLocaleString("en-IN")}</span>
                </div>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate("checkout");
                  }}
                  className="w-full py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                >
                  Checkout
                  <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
                </button>
                <button
                  onClick={() => {
                    setCartOpen(false);
                    navigate("cart");
                  }}
                  className="w-full py-3 text-[12px] font-medium tracking-widest uppercase text-[#666] hover:text-[#111] transition-colors mt-2"
                >
                  View Full Bag
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}