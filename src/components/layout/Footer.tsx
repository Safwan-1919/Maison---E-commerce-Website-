"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { ArrowUp, Instagram, Twitter, Facebook, Youtube, Check } from "lucide-react";

const footerLinks = {
  Shop: ["New Arrivals", "Best Sellers", "Trending", "Sale", "Gift Cards"],
  Help: ["Contact Us", "Shipping Info", "Returns & Exchanges", "Size Guide", "FAQs"],
  Company: ["About Us", "Careers", "Sustainability", "Press", "Affiliates"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"],
};

const socialLinks = [
  { icon: Instagram, label: "Instagram", href: "#" },
  { icon: Twitter, label: "Twitter", href: "#" },
  { icon: Facebook, label: "Facebook", href: "#" },
  { icon: Youtube, label: "YouTube", href: "#" },
];

const paymentIcons = ["Visa", "Mastercard", "Amex", "UPI", "Paytm"];

export function Footer() {
  const { navigate, showNotification } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubscribe = async () => {
    if (!email.trim()) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        setSubscribed(true);
        showNotification(data.message, "success");
      } else {
        showNotification(data.message, "error");
      }
    } catch {
      showNotification("Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-[#111] text-[#F8F8F6]">
      {/* Newsletter */}
      <div className="border-b border-[#2A2A2A]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h3 className="text-[24px] lg:text-[32px] font-medium tracking-tight mb-2">
                Stay in the loop
              </h3>
              <p className="text-[14px] text-[#999]">
                Be the first to know about new arrivals, exclusive offers, and curated style content.
              </p>
            </div>
            {subscribed ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 px-5 py-3 bg-[#1A1A1A] border border-[#4D5B47] w-full lg:w-auto"
              >
                <Check className="w-4 h-4 text-[#4D5B47] shrink-0" strokeWidth={2} />
                <span className="text-[14px] text-[#F8F8F6]">You&apos;re in!</span>
              </motion.div>
            ) : (
              <div className="flex gap-3 w-full lg:w-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                  className="flex-1 lg:w-[300px] px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F8F8F6] text-[14px] placeholder:text-[#666] outline-none focus:border-[#4D5B47] transition-colors"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="px-6 py-3 bg-[#F8F8F6] text-[#111] text-[12px] font-medium tracking-widest uppercase hover:bg-[#E8E8E8] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Subscribing…" : "Subscribe"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-[12px] font-medium tracking-widest uppercase text-[#999] mb-4">
                {title}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <button
                      onClick={() => navigate("home")}
                      className="text-[13px] text-[#999] hover:text-[#F8F8F6] transition-colors"
                    >
                      {link}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Social + Payment */}
      <div className="border-t border-[#2A2A2A]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social */}
            <div className="flex items-center gap-5">
              <span className="text-[11px] text-[#666] tracking-wider uppercase mr-2">Follow Us</span>
              {socialLinks.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  aria-label={s.label}
                  className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] hover:border-[#4D5B47] transition-colors"
                >
                  <s.icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                </a>
              ))}
            </div>

            {/* Payment */}
            <div className="flex items-center gap-4">
              <span className="text-[11px] text-[#666] tracking-wider uppercase mr-1">We Accept</span>
              <div className="flex items-center gap-2">
                {paymentIcons.map((name) => (
                  <span key={name} className="text-[12px] font-medium text-[#666]">
                    {name}
                  </span>
                ))}
              </div>
            </div>

            {/* Copyright */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6">
                <span className="text-[18px] font-medium tracking-[0.15em]">MAISON</span>
                <span className="text-[12px] text-[#666]">© 2025 All rights reserved</span>
              </div>
              <button
                onClick={scrollToTop}
                className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] hover:border-[#4D5B47] transition-colors"
              >
                <ArrowUp className="w-3.5 h-3.5" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}