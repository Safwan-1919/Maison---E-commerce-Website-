"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, Check, ArrowRight } from "lucide-react";

const STORAGE_KEY = "maison-newsletter-dismissed";
const SHOW_DELAY = 5000;
const SUCCESS_DISMISS_DELAY = 3000;

export function NewsletterPopup() {
  const [visible, setVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // localStorage may be unavailable
    }
  }, []);

  useEffect(() => {
    try {
      if (localStorage.getItem(STORAGE_KEY) === "true") return;
    } catch {
      // localStorage may be unavailable, show popup anyway
    }

    timerRef.current = setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Auto-dismiss on success
  useEffect(() => {
    if (!success) return;
    const t = setTimeout(dismiss, SUCCESS_DISMISS_DELAY);
    return () => clearTimeout(t);
  }, [success, dismiss]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) {
        setSuccess(true);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 320 }}
          className="fixed bottom-6 right-6 z-[80] w-[380px] max-w-[calc(100vw-3rem)] bg-white shadow-lg rounded-[4px] border-l-[3px] border-l-[#4D5B47]"
        >
          {/* Close button */}
          <button
            onClick={dismiss}
            className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center text-[#999] hover:text-[#111] transition-colors"
            aria-label="Close newsletter popup"
          >
            <X className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <div className="p-6 pr-10">
            {!success ? (
              <>
                {/* Label */}
                <p className="text-[10px] tracking-widest uppercase text-[#999] mb-2">
                  Join the Maison Family
                </p>

                {/* Heading */}
                <h3 className="text-[18px] font-medium text-[#111] mb-1.5 leading-snug">
                  Get 10% Off Your First Order
                </h3>

                {/* Description */}
                <p className="text-[13px] text-[#666] leading-relaxed mb-5">
                  Subscribe for early access to new collections, exclusive
                  offers, and style inspiration.
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-2.5">
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#999] pointer-events-none"
                      strokeWidth={1.5}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (error) setError("");
                      }}
                      placeholder="Your email address"
                      className="w-full pl-9 pr-3 py-2.5 text-[13px] text-[#111] placeholder:text-[#999] bg-white border border-[#E8E8E8] rounded-[4px] outline-none focus:border-[#4D5B47] transition-colors"
                    />
                  </div>
                  {error && (
                    <p className="text-[11px] text-red-500">{error}</p>
                  )}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 bg-[#4D5B47] text-white text-[12px] font-medium tracking-widest uppercase py-2.5 rounded-[4px] hover:bg-[#3d4a38] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Subscribe
                        <ArrowRight className="w-3.5 h-3.5" strokeWidth={1.5} />
                      </>
                    )}
                  </button>
                </form>

                {/* Fine print */}
                <p className="text-[11px] text-[#999] mt-3 text-center">
                  No spam, unsubscribe anytime
                </p>
              </>
            ) : (
              /* Success state */
              <div className="flex flex-col items-center text-center py-2">
                <div className="w-12 h-12 rounded-full bg-[#4D5B47]/10 flex items-center justify-center mb-3">
                  <Check className="w-6 h-6 text-[#4D5B47]" strokeWidth={1.5} />
                </div>
                <h3 className="text-[18px] font-medium text-[#111] mb-1">
                  Welcome to MAISON!
                </h3>
                <p className="text-[13px] text-[#666] leading-relaxed">
                  Check your inbox for your 10% discount code.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}