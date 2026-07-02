"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, GitCompareArrows } from "lucide-react";
import { useStore } from "@/lib/store";

const navLinks = [
  { label: "New Arrivals", page: "shop" as const, filter: "new" },
  { label: "Men", page: "shop" as const, filter: "men" },
  { label: "Women", page: "shop" as const, filter: "women" },
  { label: "Accessories", page: "shop" as const, filter: "accessories" },
  { label: "Collections", page: "shop" as const, filter: "collections" },
];

const categories = [
  "T-Shirts",
  "Shirts",
  "Blazers",
  "Sweaters",
  "Jeans",
  "Trousers",
  "Outerwear",
  "Footwear",
  "Bags",
  "Accessories",
];

type DropdownItem = {
  label: string;
  action: "category" | "special";
  value?: string;
};

const dropdownData: Record<string, { featured?: DropdownItem; items: DropdownItem[] }> = {
  "New Arrivals": {
    featured: { label: "View All New", action: "special" },
    items: categories.map((c) => ({ label: c, action: "category" as const, value: c })),
  },
  Men: {
    featured: { label: "All Men's", action: "special" },
    items: categories.map((c) => ({ label: c, action: "category" as const, value: c })),
  },
  Women: {
    featured: { label: "All Women's", action: "special" },
    items: categories.map((c) => ({ label: c, action: "category" as const, value: c })),
  },
  Accessories: {
    featured: { label: "View All Accessories", action: "special" },
    items: [
      { label: "Watches", action: "category", value: "Watches" },
      { label: "Bags", action: "category", value: "Bags" },
      { label: "Pocket Squares", action: "category", value: "Pocket Squares" },
      { label: "Belts", action: "category", value: "Belts" },
    ],
  },
  Collections: {
    items: [
      { label: "Best Sellers", action: "special" },
      { label: "Trending", action: "special" },
      { label: "New Arrivals", action: "special" },
      { label: "Under ₹5,000", action: "special" },
      { label: "Premium (₹10,000+)", action: "special" },
    ],
  },
};

export function Navigation() {
  const { navigate, toggleCart, getCartCount, wishlistItems, setSearchOpen, setMobileMenuOpen, resetFilters, setFilter, compareItems, setCompareOpen } = useStore();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartBadgeKey, setCartBadgeKey] = useState(0);
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const prevCartCount = useRef(0);
  const cartCount = getCartCount();

  // Sticky nav: threshold at 100px
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Cart badge pulse animation
  useEffect(() => {
    if (cartCount > prevCartCount.current && prevCartCount.current >= 0) {
      setCartBadgeKey((k) => k + 1);
    }
    prevCartCount.current = cartCount;
  }, [cartCount]);

  // Ctrl+K keyboard shortcut for search
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "k") {
      e.preventDefault();
      setSearchOpen(true);
    }
  }, [setSearchOpen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleDropdownClick = (item: DropdownItem) => {
    resetFilters();
    if (item.action === "category" && item.value) {
      setFilter("category", [item.value]);
    }
    navigate("shop");
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (page: "shop", filter?: string) => {
    if (filter === "new") {
      // Will be handled in shop page
    }
    navigate(page);
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#F8F8F6]/95 backdrop-blur-md border-b border-[#E8E8E8] shadow-sm"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Left - Mobile Menu + Links */}
            <div className="flex items-center gap-8">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const dropdown = dropdownData[link.label];
                  const isOpen = activeDropdown === link.label;
                  return (
                    <div
                      key={link.label}
                      className="relative"
                      onMouseEnter={() => {
                        if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
                        setActiveDropdown(link.label);
                      }}
                      onMouseLeave={() => {
                        dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
                      }}
                    >
                      <button
                        onClick={() => handleNavClick(link.page, link.filter)}
                        className="group relative px-3 py-2 text-[13px] font-normal tracking-wide text-[#111] hover:text-[#666] transition-colors flex items-center gap-1"
                      >
                        {link.label}
                        <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        {/* Underline animation */}
                        <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#4D5B47] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out" />
                      </button>

                      <AnimatePresence>
                        {isOpen && dropdown && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                            className="absolute top-full left-0 pt-2 overflow-hidden"
                            onMouseEnter={() => {
                              if (dropdownTimeout.current) clearTimeout(dropdownTimeout.current);
                            }}
                            onMouseLeave={() => {
                              dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 200);
                            }}
                          >
                            <div className="bg-white border border-[#E8E8E8] shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-w-[400px] overflow-hidden">
                              {dropdown.featured && (
                                <button
                                  onClick={() => handleDropdownClick(dropdown.featured!)}
                                  className="block w-full text-left px-5 py-2.5 text-[13px] font-medium text-[#4D5B47] border-b border-[#E8E8E8] hover:bg-[#F8F8F6] transition-colors"
                                >
                                  {dropdown.featured.label}
                                </button>
                              )}
                              <div className="grid grid-cols-2">
                                {dropdown.items.map((item) => (
                                  <button
                                    key={item.label}
                                    onClick={() => handleDropdownClick(item)}
                                    className="block w-full text-left px-5 py-2.5 text-[13px] text-[#111] border-b border-r border-[#E8E8E8] last:border-b-0 hover:bg-[#F8F8F6] hover:text-[#4D5B47] transition-colors truncate"
                                  >
                                    {item.label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </nav>
            </div>

            {/* Center - Logo */}
            <button
              onClick={() => navigate("home")}
              className="absolute left-1/2 -translate-x-1/2"
            >
              <h1 className="text-[20px] sm:text-[22px] font-medium tracking-[0.15em] text-[#111]">
                MAISON
              </h1>
            </button>

            {/* Right - Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Search with tooltip */}
              <div
                className="relative"
                onMouseEnter={() => setShowSearchTooltip(true)}
                onMouseLeave={() => setShowSearchTooltip(false)}
              >
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
                <AnimatePresence>
                  {showSearchTooltip && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-1.5 px-2.5 py-1 bg-[#111] text-[#F8F8F6] text-[11px] whitespace-nowrap pointer-events-none"
                    >
                      Search (Ctrl+K)
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => navigate("wishlist")}
                className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity relative"
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1 right-1 w-[18px] h-[18px] bg-[#111] text-[#F8F8F6] text-[10px] font-bold flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              <button
                onClick={toggleCart}
                className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {cartCount > 0 && (
                  <span
                    key={cartBadgeKey}
                    className="absolute top-1 right-1 w-[18px] h-[18px] bg-[#111] text-[#F8F8F6] text-[10px] font-bold flex items-center justify-center badge-pop"
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => navigate("account")}
                className="hidden sm:flex w-10 h-10 items-center justify-center hover:opacity-60 transition-opacity"
                aria-label="Account"
              >
                <User className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>

              {compareItems.length > 0 && (
                <button
                  onClick={() => setCompareOpen(true)}
                  className="hidden sm:flex w-10 h-10 items-center justify-center hover:opacity-60 transition-opacity relative"
                  aria-label="Compare"
                >
                  <GitCompareArrows className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#4D5B47] text-[#F8F8F6] text-[9px] font-medium flex items-center justify-center">
                    {compareItems.length}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {useStore.getState().isMobileMenuOpen && <MobileMenuOverlay />}
      </AnimatePresence>
    </>
  );
}

function MobileMenuOverlay() {
  const { setMobileMenuOpen, navigate, getCartCount, wishlistItems } = useStore();
  const cartCount = getCartCount();

  return (
    <>
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Full-height slide-in panel from the right */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 right-0 bottom-0 w-[320px] max-w-[85vw] bg-[#F8F8F6] z-[70] lg:hidden overflow-y-auto flex flex-col"
      >
        {/* Top section: Logo + Close */}
        <div className="flex items-center justify-between px-6 h-16 shrink-0">
          <h2 className="text-[18px] font-medium tracking-[0.15em] text-[#111]">MAISON</h2>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="w-10 h-10 flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" strokeWidth={1.5} />
          </button>
        </div>

        {/* Divider */}
        <div className="border-b border-[#E8E8E8]" />

        {/* Navigation links */}
        <nav className="flex-1 px-6 py-2">
          {navLinks.map((link, i) => (
            <motion.button
              key={link.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 + 0.1 }}
              onClick={() => {
                navigate(link.page);
                setMobileMenuOpen(false);
              }}
              className="group flex items-center justify-between w-full text-left py-3.5 text-[15px] text-[#111] border-b border-[#E8E8E8] hover:pl-2 transition-all duration-200"
            >
              <span>{link.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-30 -rotate-90" strokeWidth={1.5} />
            </motion.button>
          ))}

          {/* Divider */}
          <div className="h-4" />

          {/* Secondary links */}
          {[
            { label: "My Account", page: "account" as const, icon: <User className="w-4 h-4" strokeWidth={1.5} /> },
            { label: "Wishlist", page: "wishlist" as const, icon: <Heart className="w-4 h-4" strokeWidth={1.5} />, count: wishlistItems.length },
            { label: "Cart", page: "shop" as const, icon: <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />, count: cartCount, action: "cart" as const },
            { label: "Help & Support", page: "home" as const, icon: null },
          ].map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 + 0.35 }}
              onClick={() => {
                if (item.action === "cart") {
                  useStore.getState().toggleCart();
                } else {
                  navigate(item.page);
                }
                setMobileMenuOpen(false);
              }}
              className="group flex items-center justify-between w-full text-left py-3 text-[14px] text-[#666] border-b border-[#E8E8E8] hover:text-[#111] hover:pl-2 transition-all duration-200"
            >
              <span className="flex items-center gap-3">
                {item.icon}
                {item.label}
              </span>
              {item.count !== undefined && item.count > 0 && (
                <span className="text-[11px] text-[#999] bg-[#E8E8E8] px-2 py-0.5 font-medium">
                  {item.count}
                </span>
              )}
            </motion.button>
          ))}
        </nav>

        {/* Bottom section: Social media */}
        <div className="shrink-0 px-6 pb-6">
          {/* Divider */}
          <div className="border-b border-[#E8E8E8] mb-5" />

          {/* Social icons row */}
          <div className="flex items-center gap-5">
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}
              className="text-[#999] hover:text-[#111] transition-colors"
              aria-label="Instagram"
            >
              {/* Instagram icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="4" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}
              className="text-[#999] hover:text-[#111] transition-colors"
              aria-label="Twitter / X"
            >
              {/* X (Twitter) icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4l6.5 8L4 20h2l5.5-6.8L16 20h4l-6.8-8.5L20 4h-2l-5.2 6.3L8 4H4z" />
              </svg>
            </a>
            <a
              href="#"
              onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); }}
              className="text-[#999] hover:text-[#111] transition-colors"
              aria-label="Pinterest"
            >
              {/* Pinterest icon */}
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 18c.5-1.5 1.5-3.5 1.5-5a2 2 0 1 1 2 2c-1 0-1.5-.5-1.5-1.5a4 4 0 1 1 4 4c-2.5 0-4-1.5-4-4 0-1.5.5-3 1.5-4.5" />
              </svg>
            </a>
          </div>

          <p className="mt-4 text-[11px] text-[#999] tracking-wide">
            © 2025 MAISON. All rights reserved.
          </p>
        </div>
      </motion.div>
    </>
  );
}