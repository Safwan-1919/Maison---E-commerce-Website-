"use client";

import { useState, useEffect, useRef } from "react";
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
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const cartCount = getCartCount();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
            ? "bg-[#F8F8F6]/95 backdrop-blur-md border-b border-[#E8E8E8]"
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
                        className="px-3 py-2 text-[13px] font-normal tracking-wide text-[#111] hover:text-[#666] transition-colors flex items-center gap-1"
                      >
                        {link.label}
                        <ChevronDown className={`w-3.5 h-3.5 opacity-50 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
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
              <button
                onClick={() => setSearchOpen(true)}
                className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity"
                aria-label="Search"
              >
                <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
              </button>
              <button
                onClick={() => navigate("wishlist")}
                className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity relative"
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {wishlistItems.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#111] text-[#F8F8F6] text-[9px] font-medium flex items-center justify-center">
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
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#111] text-[#F8F8F6] text-[9px] font-medium flex items-center justify-center">
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

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {useStore.getState().isMobileMenuOpen && <MobileMenuOverlay />}
      </AnimatePresence>
    </>
  );
}

function MobileMenuOverlay() {
  const { setMobileMenuOpen, navigate } = useStore();

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/40 z-[60] lg:hidden"
        onClick={() => setMobileMenuOpen(false)}
      />
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        exit={{ x: "-100%" }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="fixed top-0 left-0 bottom-0 w-[300px] bg-[#F8F8F6] z-[70] lg:hidden overflow-y-auto"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[18px] font-medium tracking-[0.15em]">MAISON</h2>
            <button onClick={() => setMobileMenuOpen(false)} className="w-10 h-10 flex items-center justify-center">
              <X className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav className="space-y-1">
            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.1 }}
                onClick={() => {
                  navigate(link.page);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 px-0 text-[15px] text-[#111] border-b border-[#E8E8E8] hover:text-[#666] transition-colors"
              >
                {link.label}
              </motion.button>
            ))}
          </nav>

          <div className="mt-8 space-y-1">
            {[
              { label: "My Account", page: "account" as const },
              { label: "Wishlist", page: "wishlist" as const },
              { label: "Track Order", page: "order-tracking" as const },
            ].map((item, i) => (
              <motion.button
                key={item.label}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 + 0.4 }}
                onClick={() => {
                  navigate(item.page);
                  setMobileMenuOpen(false);
                }}
                className="block w-full text-left py-3 px-0 text-[14px] text-[#666] border-b border-[#E8E8E8] hover:text-[#111] transition-colors"
              >
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  );
}