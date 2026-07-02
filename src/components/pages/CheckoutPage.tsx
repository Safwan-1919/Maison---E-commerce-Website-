"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import {
  ChevronRight, CreditCard, Wallet, Building2, Smartphone, Truck,
  CheckCircle, ArrowLeft, Shield, Lock
} from "lucide-react";
import Image from "next/image";

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
            <span className={`text-[12px] tracking-widest uppercase hidden sm:inline ${
              i <= currentStep ? "text-[#111] font-medium" : "text-[#999]"
            }`}>
              {step}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-12 sm:w-20 h-px mx-3 ${i < currentStep ? "bg-[#111]" : "bg-[#E8E8E8]"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function CheckoutPage() {
  const { cartItems, getCartTotal, getCartMrpTotal, getCartCount, navigate, clearCart, showNotification } = useStore();
  const [step, setStep] = useState(0);
  const [placing, setPlacing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  const [shipping, setShipping] = useState({
    fullName: "", email: "", phone: "",
    address1: "", address2: "", city: "", state: "", pincode: "", country: "India",
  });
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "", name: "" });
  const [upiId, setUpiId] = useState("");
  const [agreed, setAgreed] = useState(false);

  const total = getCartTotal();
  const mrpTotal = getCartMrpTotal();
  const shippingCost = total >= 2000 ? 0 : 149;
  const finalTotal = total + shippingCost;

  const paymentMethods = [
    { id: "card", label: "Credit / Debit Card", icon: CreditCard },
    { id: "upi", label: "UPI", icon: Smartphone },
    { id: "netbanking", label: "Net Banking", icon: Building2 },
    { id: "wallet", label: "Wallet", icon: Wallet },
    { id: "cod", label: "Cash on Delivery", icon: Truck },
  ];

  const handlePlaceOrder = async () => {
    if (!agreed) return;
    setPlacing(true);
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
          shipping: shippingCost,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setOrderNumber(data.order.orderNumber);
        setOrderSuccess(true);
        clearCart();
      }
    } catch (e) {
      console.error(e);
    }
    setPlacing(false);
  };

  if (cartItems.length === 0 && !orderSuccess) {
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-[15px] text-[#666] mb-4">Your bag is empty</p>
          <button onClick={() => navigate("shop")} className="px-6 py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase">
            Shop Now
          </button>
        </div>
      </main>
    );
  }

  if (orderSuccess) {
    const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-20 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md mx-auto px-4"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", damping: 15 }}
            className="w-16 h-16 bg-[#4D5B47] rounded-full flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-[24px] sm:text-[28px] font-medium tracking-[-0.02em] mb-2">Order Placed!</h1>
          <p className="text-[14px] text-[#666] mb-1">Thank you for your purchase</p>
          <p className="text-[13px] text-[#999] mb-6">
            Order #{orderNumber} &middot; Est. delivery by{" "}
            {deliveryDate.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" })}
          </p>
          <p className="text-[32px] font-medium mb-8">{"\u20B9"}{finalTotal.toLocaleString("en-IN")}</p>
          <button
            onClick={() => navigate("home")}
            className="px-8 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors"
          >
            Continue Shopping
          </button>
        </motion.div>
      </main>
    );
  }

  const InputField = ({ label, name, value, onChange, type = "text", placeholder, required = true }: {
    label: string; name: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; required?: boolean;
  }) => (
    <div>
      <label className="block text-[11px] font-medium tracking-wider uppercase text-[#999] mb-1.5">
        {label} {required && <span className="text-[#C53030]">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2.5 border border-[#E8E8E8] text-[14px] outline-none focus:border-[#111] transition-colors bg-white placeholder:text-[#D1D1D1]"
      />
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8F8F6] pt-20 pb-16">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
        <StepIndicator currentStep={step} />

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Form */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="shipping" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h2 className="text-[20px] font-medium mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <InputField label="Full Name" name="fullName" value={shipping.fullName} onChange={(v) => setShipping({ ...shipping, fullName: v })} placeholder="John Doe" />
                      <InputField label="Email" name="email" value={shipping.email} onChange={(v) => setShipping({ ...shipping, email: v })} type="email" placeholder="john@example.com" />
                    </div>
                    <InputField label="Phone" name="phone" value={shipping.phone} onChange={(v) => setShipping({ ...shipping, phone: v })} type="tel" placeholder="+91 98765 43210" />
                    <InputField label="Address Line 1" name="address1" value={shipping.address1} onChange={(v) => setShipping({ ...shipping, address1: v })} placeholder="Street address, apartment, suite" />
                    <InputField label="Address Line 2" name="address2" value={shipping.address2} onChange={(v) => setShipping({ ...shipping, address2: v })} placeholder="Optional" required={false} />
                    <div className="grid grid-cols-3 gap-4">
                      <InputField label="City" name="city" value={shipping.city} onChange={(v) => setShipping({ ...shipping, city: v })} />
                      <InputField label="State" name="state" value={shipping.state} onChange={(v) => setShipping({ ...shipping, state: v })} />
                      <InputField label="Pincode" name="pincode" value={shipping.pincode} onChange={(v) => setShipping({ ...shipping, pincode: v })} />
                    </div>
                  </div>
                  <button
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
                  <h2 className="text-[20px] font-medium mb-6">Payment Method</h2>

                  <div className="space-y-2 mb-6">
                    {paymentMethods.map((pm) => (
                      <button
                        key={pm.id}
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`w-full flex items-center gap-3 p-4 border transition-all text-left ${
                          paymentMethod === pm.id
                            ? "border-[#111] bg-white"
                            : "border-[#E8E8E8] hover:border-[#999]"
                        }`}
                      >
                        <pm.icon className={`w-5 h-5 ${paymentMethod === pm.id ? "text-[#111]" : "text-[#999]"}`} strokeWidth={1.5} />
                        <span className={`text-[14px] ${paymentMethod === pm.id ? "font-medium text-[#111]" : "text-[#666]"}`}>{pm.label}</span>
                        {paymentMethod === pm.id && <CheckCircle className="w-4 h-4 text-[#4D5B47] ml-auto" />}
                      </button>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {paymentMethod === "card" && (
                      <motion.div key="card-form" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-4 overflow-hidden">
                        <InputField label="Card Number" name="card" value={cardDetails.number} onChange={(v) => setCardDetails({ ...cardDetails, number: v })} placeholder="4242 4242 4242 4242" />
                        <div className="grid grid-cols-2 gap-4">
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
                    <button
                      onClick={() => setStep(0)}
                      className="flex-1 py-3.5 border border-[#E8E8E8] text-[12px] tracking-[0.15em] uppercase text-[#666] hover:border-[#999] transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
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
                  <h2 className="text-[20px] font-medium mb-6">Review Your Order</h2>

                  {/* Shipping Summary */}
                  <div className="p-4 border border-[#E8E8E8] bg-white mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium tracking-wider uppercase text-[#999]">Shipping Address</span>
                      <button onClick={() => setStep(0)} className="text-[11px] text-[#4D5B47] hover:text-[#111]">Edit</button>
                    </div>
                    <p className="text-[13px] text-[#111]">{shipping.fullName}</p>
                    <p className="text-[13px] text-[#666]">{shipping.address1}{shipping.address2 ? `, ${shipping.address2}` : ""}</p>
                    <p className="text-[13px] text-[#666]">{shipping.city}, {shipping.state} - {shipping.pincode}</p>
                    <p className="text-[13px] text-[#666]">{shipping.phone} &middot; {shipping.email}</p>
                  </div>

                  {/* Payment Summary */}
                  <div className="p-4 border border-[#E8E8E8] bg-white mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-medium tracking-wider uppercase text-[#999]">Payment Method</span>
                      <button onClick={() => setStep(1)} className="text-[11px] text-[#4D5B47] hover:text-[#111]">Edit</button>
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
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
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
                      I agree to the <button className="underline text-[#111]">Terms &amp; Conditions</button> and{" "}
                      <button className="underline text-[#111]">Privacy Policy</button>. I understand this is a demo checkout.
                    </span>
                  </label>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3.5 border border-[#E8E8E8] text-[12px] tracking-[0.15em] uppercase text-[#666] hover:border-[#999] transition-colors flex items-center justify-center gap-2"
                    >
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button
                      onClick={handlePlaceOrder}
                      disabled={!agreed || placing}
                      className="flex-[2] py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
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
            <div className="sticky top-[88px] bg-white border border-[#E8E8E8] p-5">
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
                <div className="flex justify-between text-[13px]">
                  <span className="text-[#666]">Shipping</span>
                  <span>{shippingCost === 0 ? <span className="text-[#4D5B47]">FREE</span> : "\u20B9149"}</span>
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
    </main>
  );
}