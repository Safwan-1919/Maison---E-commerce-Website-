"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const announcements = [
  { text: "Free shipping on all orders over ₹2,000", accent: false },
  { text: "New Season Arrivals — Explore the Collection", accent: true },
  { text: "Use code MAISON20 for 20% off your first order", accent: false },
  { text: "Easy 30-day returns — No questions asked", accent: false },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const next = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % announcements.length);
  }, []);

  useEffect(() => {
    const interval = setInterval(next, 4000);
    return () => clearInterval(interval);
  }, [next]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: -40 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="relative bg-[#111] text-[#F8F8F6] overflow-hidden"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center h-9 relative">
          <AnimatePresence mode="wait">
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className={`text-[12px] tracking-[0.04em] text-center ${
                announcements[currentIndex].accent
                  ? "text-[#4D5B47] font-medium"
                  : "text-[#999]"
              }`}
            >
              {announcements[currentIndex].text}
            </motion.p>
          </AnimatePresence>

          {/* Dots indicator */}
          <div className="absolute right-16 flex items-center gap-1.5">
            {announcements.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-1 h-1 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "bg-[#F8F8F6] w-3" : "bg-[#444]"
                }`}
                aria-label={`Go to announcement ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-[#666] hover:text-[#F8F8F6] transition-colors"
            aria-label="Dismiss announcement"
          >
            <X className="w-3.5 h-3.5" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}