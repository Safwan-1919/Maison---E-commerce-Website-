"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import {
  Search, Package, Truck, CheckCircle, MapPin,
  Clock, ChevronRight, ArrowLeft
} from "lucide-react";
import Image from "next/image";

interface TrackingStep {
  label: string;
  date: string;
  time: string;
  description: string;
  completed: boolean;
  current: boolean;
}

const demoTrackingSteps: TrackingStep[] = [
  { label: "Order Placed", date: "Jan 15", time: "10:32 AM", description: "Your order has been placed successfully", completed: true, current: false },
  { label: "Confirmed", date: "Jan 15", time: "10:45 AM", description: "Order confirmed and being prepared", completed: true, current: false },
  { label: "Shipped", date: "Jan 16", time: "02:15 PM", description: "Package shipped via BlueDart - AWB: BD1234567890", completed: true, current: false },
  { label: "Out for Delivery", date: "Jan 18", time: "08:00 AM", description: "Your package is out for delivery today", completed: false, current: true },
  { label: "Delivered", date: "", time: "", description: "Expected delivery by Jan 18", completed: false, current: false },
];

const demoOrder = {
  orderNumber: "MSN-LX9K2P",
  items: [
    { name: "Essential Cotton Crew Tee", size: "M", color: "White", price: 2490, quantity: 2, image: "/images/products/product-2.png" },
    { name: "Premium Raw Selvedge Denim", size: "32", color: "Dark Indigo", price: 6990, quantity: 1, image: "/images/products/product-3.png" },
  ],
  address: { name: "Arjun Mehta", line1: "42, HSR Layout, Sector 2", city: "Bangalore", state: "Karnataka", pincode: "560102", phone: "+91 98765 43210" },
  paymentMethod: "Credit Card",
  total: 11970,
};

export default function OrderTrackingPage() {
  const { navigate } = useStore();
  const [orderInput, setOrderInput] = useState("");
  const [tracking, setTracking] = useState(false);

  const handleTrack = () => {
    if (orderInput.trim()) {
      setTracking(true);
    }
  };

  const showDemo = () => {
    setOrderInput("MSN-LX9K2P");
    setTracking(true);
  };

  return (
    <main className="min-h-screen bg-[#F8F8F6] pt-20 pb-16">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        <ScrollReveal>
          <h1 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em] mb-2">Track Your Order</h1>
          <p className="text-[14px] text-[#999] mb-8">Enter your order number to get real-time updates</p>
        </ScrollReveal>

        {/* Search */}
        <ScrollReveal delay={0.1}>
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999]" strokeWidth={1.5} />
              <input
                type="text"
                value={orderInput}
                onChange={(e) => setOrderInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                placeholder="Enter order number (e.g., MSN-LX9K2P)"
                className="w-full pl-10 pr-4 py-3.5 border border-[#E8E8E8] bg-white text-[14px] outline-none focus:border-[#111] transition-colors placeholder:text-[#D1D1D1]"
              />
            </div>
            <button
              onClick={handleTrack}
              className="px-6 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Track
            </button>
          </div>
          <button onClick={showDemo} className="text-[12px] text-[#4D5B47] hover:text-[#111] transition-colors tracking-wide">
            Try demo tracking →
          </button>
        </ScrollReveal>

        {/* Tracking Result */}
        <AnimatePresence>
          {tracking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="mt-10"
            >
              {/* Order Info Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-white border border-[#E8E8E8] mb-8">
                <div>
                  <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-1">Order Number</p>
                  <p className="text-[18px] font-medium">{demoOrder.orderNumber}</p>
                </div>
                <div className="mt-3 sm:mt-0 flex items-center gap-2">
                  <div className="w-2 h-2 bg-[#4D5B47] rounded-full animate-pulse" />
                  <span className="text-[13px] text-[#4D5B47] font-medium">Out for Delivery</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="bg-white border border-[#E8E8E8] p-6 sm:p-8 mb-8">
                <h2 className="text-[16px] font-medium mb-8">Delivery Timeline</h2>
                <div className="relative">
                  {/* Vertical Line */}
                  <div className="absolute left-[15px] top-2 bottom-2 w-px bg-[#E8E8E8]" />
                  <div
                    className="absolute left-[15px] top-2 w-px bg-[#111] transition-all duration-700"
                    style={{ height: `${(demoTrackingSteps.filter((s) => s.completed).length / (demoTrackingSteps.length - 1)) * 100}%` }}
                  />

                  <div className="space-y-0">
                    {demoTrackingSteps.map((step, i) => (
                      <motion.div
                        key={step.label}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1, duration: 0.3 }}
                        className="relative flex gap-5 pb-8 last:pb-0"
                      >
                        {/* Dot */}
                        <div className="relative z-10 flex-shrink-0">
                          <div
                            className={`w-[32px] h-[32px] flex items-center justify-center border-2 transition-colors ${
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

                        {/* Content */}
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

              {/* Order Details */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Items */}
                <div className="bg-white border border-[#E8E8E8] p-5">
                  <h3 className="text-[13px] font-medium tracking-wider uppercase text-[#999] mb-4">Items Ordered</h3>
                  <div className="space-y-4">
                    {demoOrder.items.map((item, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="w-14 h-18 bg-[#F0EFED] relative overflow-hidden flex-shrink-0">
                          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="56px" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-[#111] line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-[#999]">{item.size} / {item.color} &middot; Qty: {item.quantity}</p>
                          <p className="text-[13px] font-medium mt-0.5">{"\u20B9"}{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-[#E8E8E8] flex justify-between">
                    <span className="text-[13px] font-medium">Total</span>
                    <span className="text-[13px] font-medium">{"\u20B9"}{demoOrder.total.toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {/* Shipping & Payment */}
                <div className="space-y-6">
                  <div className="bg-white border border-[#E8E8E8] p-5">
                    <h3 className="text-[13px] font-medium tracking-wider uppercase text-[#999] mb-3">Shipping Address</h3>
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-[#999] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                      <div>
                        <p className="text-[13px] text-[#111] font-medium">{demoOrder.address.name}</p>
                        <p className="text-[13px] text-[#666]">{demoOrder.address.line1}</p>
                        <p className="text-[13px] text-[#666]">{demoOrder.address.city}, {demoOrder.address.state} - {demoOrder.address.pincode}</p>
                        <p className="text-[13px] text-[#666]">{demoOrder.address.phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-white border border-[#E8E8E8] p-5">
                    <h3 className="text-[13px] font-medium tracking-wider uppercase text-[#999] mb-3">Payment</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#F0EFED] flex items-center justify-center">
                        <span className="text-[11px] font-medium text-[#666]">{"\u20B9"}</span>
                      </div>
                      <div>
                        <p className="text-[13px] text-[#111]">{demoOrder.paymentMethod}</p>
                        <p className="text-[11px] text-[#999]">Payment completed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}