"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useStore } from "@/lib/store";
import { BRAND_NAME } from "@/lib/constants";
import { ArrowUp, Instagram, Twitter, Facebook, Youtube, Check } from "lucide-react";

const defaultFooterLinks = {
  Shop: ["New Arrivals", "Best Sellers", "Trending", "Sale", "Gift Cards"],
  Help: ["Contact Us", "Shipping Info", "Returns & Exchanges", "Size Guide", "FAQs"],
  Company: ["About Us", "Careers", "Sustainability", "Press", "Affiliates"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy", "Accessibility"],
};

const defaultFooterLinkRoutes: Record<string, string> = {
  "New Arrivals": "shop?sort=newest",
  "Best Sellers": "shop?sort=bestselling",
  "Trending": "shop?sort=trending",
  "Sale": "sale",
  "Gift Cards": "gift-cards",
  "Contact Us": "contact",
  "Shipping Info": "shipping",
  "Returns & Exchanges": "returns",
  "Size Guide": "size-guide",
  "FAQs": "faq",
  "About Us": "about",
  "Careers": "careers",
  "Sustainability": "sustainability",
  "Press": "press",
  "Affiliates": "affiliates",
  "Privacy Policy": "privacy",
  "Terms of Service": "terms",
  "Cookie Policy": "cookie-policy",
  "Accessibility": "accessibility",
};

const contentPageKeys: Record<string, string> = {
  "Contact Us": "contact",
  "Shipping Info": "shipping",
  "Returns & Exchanges": "returns",
  "Size Guide": "size-guide",
  FAQs: "faq",
  "About Us": "about",
  Careers: "careers",
  Sustainability: "sustainability",
  Press: "press",
  Affiliates: "affiliates",
  "Privacy Policy": "privacy",
  "Terms of Service": "terms",
  "Cookie Policy": "cookie-policy",
  Accessibility: "accessibility",
};

const shopFilterMap: Record<string, string> = {
  "New Arrivals": "newest",
  "Best Sellers": "bestselling",
  Trending: "trending",
  Sale: "popular",
  "Gift Cards": "popular",
};

const iconMap: Record<string, typeof Instagram> = { Instagram, Twitter, Facebook, Youtube };

const defaultSocialLinks = [
  { icon: "Instagram", label: "Instagram", href: "#" },
  { icon: "Twitter", label: "Twitter", href: "#" },
  { icon: "Facebook", label: "Facebook", href: "#" },
  { icon: "Youtube", label: "YouTube", href: "#" },
];

const defaultPaymentIcons = ["Visa", "Mastercard", "Amex", "UPI", "Paytm"];

const defaultBrandPromise = [
  { title: "Crafted with Care", description: "Every piece tells a story of meticulous craftsmanship" },
  { title: "Sustainably Sourced", description: "Responsible materials for a conscious wardrobe" },
  { title: "Timeless Design", description: "Investment pieces that transcend seasons" },
];

export function Footer() {
  const { navigate, showNotification } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  const [footerLinks, setFooterLinks] = useState(defaultFooterLinks);
  const [footerLinkRoutes, setFooterLinkRoutes] = useState(defaultFooterLinkRoutes);
  const [socialLinks, setSocialLinks] = useState(defaultSocialLinks);
  const [paymentIcons, setPaymentIcons] = useState(defaultPaymentIcons);
  const [brandPromise, setBrandPromise] = useState(defaultBrandPromise);
  const [newsletterHeading, setNewsletterHeading] = useState("Stay in the loop");
  const [newsletterSubtext, setNewsletterSubtext] = useState("Be the first to know about new arrivals, exclusive offers, and curated style content.");

  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => {
        const c = data.content || {};
        if (c.footer_links) {
          const parsed = typeof c.footer_links === "string" ? JSON.parse(c.footer_links) : c.footer_links;
          if (parsed.links) setFooterLinks(parsed.links);
          if (parsed.routes) setFooterLinkRoutes({ ...defaultFooterLinkRoutes, ...parsed.routes });
        }
        if (c.social_links) {
          const parsed = typeof c.social_links === "string" ? JSON.parse(c.social_links) : c.social_links;
          if (Array.isArray(parsed)) setSocialLinks(parsed);
        }
        if (c.payment_icons) {
          const parsed = typeof c.payment_icons === "string" ? JSON.parse(c.payment_icons) : c.payment_icons;
          if (Array.isArray(parsed)) setPaymentIcons(parsed);
        }
        if (c.brand_promise) {
          const parsed = typeof c.brand_promise === "string" ? JSON.parse(c.brand_promise) : c.brand_promise;
          if (Array.isArray(parsed)) setBrandPromise(parsed);
        }
        if (c.footer_newsletter_heading) setNewsletterHeading(c.footer_newsletter_heading);
        if (c.footer_newsletter_subtext) setNewsletterSubtext(c.footer_newsletter_subtext);
      })
      .catch(() => {});
  }, []);

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
    <footer className="bg-[#111] text-[#F8F8F6]" suppressHydrationWarning>
      {/* Decorative top gradient line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#4D5B47]/40 to-transparent" />
      {/* Newsletter */}
      <div className="border-b border-[#2A2A2A]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h3 className="text-[24px] lg:text-[32px] font-medium tracking-tight mb-2">
                {newsletterHeading}
              </h3>
              <p className="text-[14px] text-[#999]">
                {newsletterSubtext}
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
                  suppressHydrationWarning
                  className="flex-1 lg:w-[300px] px-4 py-3 bg-[#1A1A1A] border border-[#2A2A2A] text-[#F8F8F6] text-[14px] placeholder:text-[#666] outline-none focus:border-[#4D5B47] transition-colors"
                />
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  suppressHydrationWarning
                  className="px-6 py-3 bg-[#4D5B47] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#5C6B56] transition-colors whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Subscribing…" : "Subscribe"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Brand Promise */}
      <div className="border-b border-[#2A2A2A]">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {brandPromise.map((item, i) => (
              <div key={i}>
                <p className="text-[11px] tracking-[0.2em] uppercase text-[#666] mb-1">{item.title}</p>
                <p className="text-[13px] text-[#999]">{item.description}</p>
              </div>
            ))}
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
                      onClick={() => {
                        const key = contentPageKeys[link];
                        const sort = shopFilterMap[link];
                        if (key) {
                          navigate("content", undefined, undefined, key);
                        } else if (sort) {
                          useStore.getState().setFilter("sortBy", sort);
                          navigate("shop");
                        }
                      }}
                      suppressHydrationWarning
                      className="text-[13px] text-[#999] hover:text-[#F8F8F6] hover:pl-1 transition-all duration-200"
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
        <div className="h-px bg-gradient-to-r from-transparent via-[#4D5B47]/20 to-transparent" />
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Social */}
            <div className="flex items-center gap-5">
              <span className="text-[11px] text-[#666] tracking-wider uppercase mr-2">Follow Us</span>
              {socialLinks.map((s) => {
                const Icon = iconMap[s.icon] || Instagram;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-8 h-8 flex items-center justify-center border border-[#2A2A2A] hover:border-[#4D5B47] hover:scale-110 transition-all duration-200"
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </a>
                );
              })}
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
              <div className="flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
                <span className="text-[16px] sm:text-[18px] font-medium tracking-[0.15em] truncate">{BRAND_NAME}</span>
                <span className="text-[11px] sm:text-[12px] text-[#666]">© {new Date().getFullYear()} All rights reserved</span>
              </div>
              <button
                onClick={scrollToTop}
                suppressHydrationWarning
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
