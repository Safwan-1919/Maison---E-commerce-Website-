"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown } from "lucide-react";
import { useStore } from "@/lib/store";

const navLinks = [
  { label: "New Arrivals", page: "shop" as const, filter: "new" },
  { label: "Men", page: "shop" as const, filter: "men" },
  { label: "Women", page: "shop" as const, filter: "women" },
  { label: "Accessories", page: "shop" as const, filter: "accessories" },
  { label: "Collections", page: "shop" as const, filter: "collections" },
];

export function Navigation() {
  const { navigate, toggleCart, getCartCount, wishlistItems, setSearchOpen, setMobileMenuOpen } = useStore();
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
                {navLinks.map((link) => (
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
                      <ChevronDown className="w-3.5 h-3.5 opacity-50" />
                    </button>
                  </div>
                ))}
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