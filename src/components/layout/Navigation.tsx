"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ShoppingBag, Heart, User, Menu, X, ChevronDown, GitCompareArrows, LogOut } from "lucide-react";
import { BRAND_NAME, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useStore } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  productCount: number;
  sortOrder: number;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

type DropdownItem = {
  label: string;
  action: "category" | "special" | "brand";
  value?: string;
};

function buildDropdownData(categories: Category[], brands: Brand[]): Record<string, { featured?: DropdownItem; items: DropdownItem[] }> {
  const catItems: DropdownItem[] = categories
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((c) => ({ label: c.name, action: "category" as const, value: c.name }));

  const brandItems: DropdownItem[] = brands.map((b) => ({
    label: b.name,
    action: "brand" as const,
    value: b.name,
  }));

  return {
    "New Arrivals": {
      featured: { label: "View All New", action: "special" },
      items: catItems,
    },
    "Shop": {
      featured: { label: "Shop All Products", action: "special" },
      items: catItems,
    },
    "Collections": {
      featured: { label: "View All Collections", action: "special" },
      items: [
        { label: "Best Sellers", action: "special" },
        { label: "Trending", action: "special" },
        { label: "New Arrivals", action: "special" },
        { label: "Under ₹5,000", action: "special" },
        { label: "Premium (₹10,000+)", action: "special" },
        ...brandItems,
      ],
    },
  };
}

export function Navigation() {
  const { navigate, toggleCart, getCartCount, wishlistItems, setSearchOpen, setMobileMenuOpen, resetFilters, setFilter, compareItems, setCompareOpen, setAuthOpen } = useStore();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [cartBadgeKey, setCartBadgeKey] = useState(0);
  const [showSearchTooltip, setShowSearchTooltip] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const dropdownTimeout = useRef<NodeJS.Timeout | null>(null);
  const prevCartCount = useRef(0);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const cartCount = getCartCount();

  const navLinks = [
    { label: "New Arrivals", page: "shop" as const, filter: "new" },
    { label: "Shop", page: "shop" as const, filter: "shop" },
    { label: "Collections", page: "shop" as const, filter: "collections" },
  ];

  // Fetch categories and brands
  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, brandRes] = await Promise.all([
          fetch("/api/categories?withCounts=true"),
          fetch("/api/brands"),
        ]);
        const catData = await catRes.json();
        const brandData = await brandRes.json();
        setCategories((catData.categories || []).sort((a: Category, b: Category) => a.sortOrder - b.sortOrder));
        setBrands(brandData.brands || []);
      } catch (e) {
        console.error("Failed to fetch nav data:", e);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => { setMounted(true); }, []);

  // Close user menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

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
    } else if (item.action === "brand" && item.value) {
      setFilter("brands", [item.value]);
    }
    navigate("shop");
    setActiveDropdown(null);
    setMobileMenuOpen(false);
  };

  const handleNavClick = (page: "shop", filter?: string) => {
    if (filter === "new") {
      resetFilters();
      setFilter("sortBy", "newest");
    }
    navigate(page);
  };

  const handleLogout = async () => {
    setUserMenuOpen(false);
    await logout();
  };

  const dropdownData = buildDropdownData(categories, brands);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#F8F8F6]/95 backdrop-blur-md border-b border-[#E8E8E8] shadow-sm"
            : "bg-[#F8F8F6]"
        }`}
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-[72px]">
            {/* Left - Mobile Menu + Links */}
            <div className="flex items-center gap-8">
              <button suppressHydrationWarning
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden w-10 h-10 flex items-center justify-center"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" strokeWidth={1.5} />
              </button>

              <nav className="hidden lg:flex items-center gap-1">
                {loading ? (
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="w-20 h-4 animate-pulse bg-[#E8E8E8] rounded-sm" />
                    ))}
                  </div>
                ) : (
                  navLinks.map((link) => {
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
                          dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 250);
                        }}
                      >
                        <button suppressHydrationWarning
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
                                dropdownTimeout.current = setTimeout(() => setActiveDropdown(null), 250);
                              }}
                            >
                              <div className="bg-white border border-[#E8E8E8] shadow-[0_8px_24px_rgba(0,0,0,0.08)] max-w-[400px] overflow-hidden">
                                {dropdown.featured && (
                                  <button suppressHydrationWarning
                                    onClick={() => handleDropdownClick(dropdown.featured!)}
                                    className="block w-full text-left px-5 py-2.5 text-[13px] font-medium text-[#4D5B47] border-b border-[#E8E8E8] hover:bg-[#F8F8F6] transition-colors"
                                  >
                                    {dropdown.featured.label}
                                  </button>
                                )}
                                <div className="grid grid-cols-2">
                                  {dropdown.items.map((item) => (
                                    <button suppressHydrationWarning
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
                  })
                )}
              </nav>
            </div>

            {/* Center - Logo */}
            <button suppressHydrationWarning
              onClick={() => navigate("home")}
              className="absolute left-1/2 -translate-x-1/2 max-w-[calc(100%-180px)] truncate hidden lg:block"
            >
              <h1 className="text-[22px] font-medium tracking-[0.15em] text-[#111]">
                {BRAND_NAME}
              </h1>
            </button>
            {/* Mobile Logo — flex child, no overlap */}
            <button suppressHydrationWarning
              onClick={() => navigate("home")}
              className="lg:hidden flex-shrink min-w-0 truncate"
            >
              <h1 className="text-[18px] font-medium tracking-[0.15em] text-[#111]">
                {BRAND_NAME}
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
                <button suppressHydrationWarning
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

              <button suppressHydrationWarning
                onClick={() => navigate("wishlist")}
                className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity relative"
                aria-label="Wishlist"
              >
                <Heart className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {mounted && wishlistItems.length > 0 && (
                  <span suppressHydrationWarning className="absolute top-1 right-1 w-[18px] h-[18px] bg-[#111] text-[#F8F8F6] text-[10px] font-bold flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </button>

              <button suppressHydrationWarning
                onClick={toggleCart}
                className="w-10 h-10 flex items-center justify-center hover:opacity-60 transition-opacity relative"
                aria-label="Cart"
              >
                <ShoppingBag className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {mounted && cartCount > 0 && (
                  <span suppressHydrationWarning
                    key={cartBadgeKey}
                    className="absolute top-1 right-1 w-[18px] h-[18px] bg-[#111] text-[#F8F8F6] text-[10px] font-bold flex items-center justify-center badge-pop"
                  >
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Auth-aware user icon */}
              <div className="relative" ref={userMenuRef}>
                {mounted && isAuthenticated && user ? (
                  <button suppressHydrationWarning
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 hover:opacity-60 transition-opacity"
                    aria-label="Account menu"
                  >
                    <div suppressHydrationWarning className="w-[30px] h-[30px] bg-[#111] text-[#F8F8F6] text-[12px] font-medium flex items-center justify-center">
                      {user.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>
                  </button>
                ) : (
                  <button suppressHydrationWarning
                    onClick={() => setAuthOpen(true)}
                    className="hidden sm:flex items-center text-[12px] tracking-wide text-[#111] hover:text-[#666] transition-colors"
                    aria-label="Sign in"
                  >
                    Sign In
                  </button>
                )}

                <AnimatePresence>
                  {userMenuOpen && isAuthenticated && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-white border border-[#E8E8E8] shadow-[0_8px_24px_rgba(0,0,0,0.08)] overflow-hidden z-50"
                    >
                      <div className="px-4 py-3 border-b border-[#E8E8E8]">
                        <p className="text-[13px] font-medium text-[#111] truncate">{user?.name || "User"}</p>
                        <p className="text-[11px] text-[#999] truncate">{user?.email || ""}</p>
                      </div>
                      <button suppressHydrationWarning
                        onClick={() => { navigate("account"); setUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2.5 text-[13px] text-[#111] hover:bg-[#F8F8F6] hover:text-[#4D5B47] transition-colors flex items-center gap-2"
                      >
                        <User className="w-4 h-4" strokeWidth={1.5} />
                        My Account
                      </button>
                      {isAdmin && (
                        <button suppressHydrationWarning
                          onClick={() => { navigate("admin"); setUserMenuOpen(false); }}
                          className="w-full text-left px-4 py-2.5 text-[13px] text-[#111] hover:bg-[#F8F8F6] hover:text-[#4D5B47] transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" strokeWidth={1.5} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                          Admin Dashboard
                        </button>
                      )}
                      <button suppressHydrationWarning
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2.5 text-[13px] text-[#111] hover:bg-[#F8F8F6] hover:text-[#C53030] transition-colors flex items-center gap-2 border-t border-[#E8E8E8]"
                      >
                        <LogOut className="w-4 h-4" strokeWidth={1.5} />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

                {mounted && compareItems.length > 0 && (
                <button suppressHydrationWarning
                  onClick={() => setCompareOpen(true)}
                  className="hidden sm:flex w-10 h-10 items-center justify-center hover:opacity-60 transition-opacity relative"
                  aria-label="Compare"
                >
                  <GitCompareArrows className="w-[18px] h-[18px]" strokeWidth={1.5} />
                  <span suppressHydrationWarning className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#4D5B47] text-[#F8F8F6] text-[9px] font-medium flex items-center justify-center">
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
        {useStore.getState().isMobileMenuOpen && (
          <MobileMenuOverlay
            categories={categories}
            brands={brands}
            loading={loading}
            isAuthenticated={isAuthenticated}
            userName={user?.name}
          />
        )}
      </AnimatePresence>
    </>
  );
}

function MobileMenuOverlay({
  categories,
  brands,
  loading,
  isAuthenticated,
  userName,
}: {
  categories: Category[];
  brands: Brand[];
  loading: boolean;
  isAuthenticated: boolean;
  userName?: string | null;
}) {
  const { setMobileMenuOpen, navigate, getCartCount, wishlistItems, resetFilters, setFilter, setAuthOpen } = useStore();
  const { logout } = useAuth();
  const cartCount = getCartCount();

  const navLinks = [
    { label: "New Arrivals", page: "shop" as const, filter: "new" },
    { label: "Shop", page: "shop" as const, filter: "shop" },
    { label: "Collections", page: "shop" as const, filter: "collections" },
  ];

  const handleNavClick = (page: "shop", filter?: string) => {
    resetFilters();
    if (filter === "new") {
      setFilter("sortBy", "newest");
    }
    navigate(page);
    setMobileMenuOpen(false);
  };

  const handleCategoryClick = (catName: string) => {
    resetFilters();
    setFilter("category", [catName]);
    navigate("shop");
    setMobileMenuOpen(false);
  };

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
  };

  return (
    <>
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] lg:hidden"
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
          <h2 className="text-[18px] font-medium tracking-[0.15em] text-[#111]">{BRAND_NAME}</h2>
          <button suppressHydrationWarning
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
            <motion.button suppressHydrationWarning
              key={link.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 + 0.1 }}
              onClick={() => handleNavClick(link.page, link.filter)}
              className="group flex items-center justify-between w-full text-left py-3.5 text-[15px] text-[#111] border-b border-[#E8E8E8] hover:pl-2 transition-all duration-200"
            >
              <span>{link.label}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-30 -rotate-90" strokeWidth={1.5} />
            </motion.button>
          ))}

          {/* Divider */}
          <div className="h-4" />

          {/* Dynamic categories */}
          {!loading && categories.length > 0 && (
            <>
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] mb-2">Categories</p>
              {categories.slice(0, 6).map((cat, i) => (
                <motion.button suppressHydrationWarning
                  key={cat.id}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 + 0.25 }}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="group flex items-center justify-between w-full text-left py-2.5 text-[13px] text-[#666] border-b border-[#E8E8E8] hover:text-[#111] hover:pl-2 transition-all duration-200"
                >
                  <span>{cat.name}</span>
                  <span className="text-[11px] text-[#999]">{cat.productCount}</span>
                </motion.button>
              ))}
              {categories.length > 6 && (
                <motion.button suppressHydrationWarning
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 }}
                  onClick={() => { navigate("shop"); setMobileMenuOpen(false); }}
                  className="group flex items-center justify-between w-full text-left py-2.5 text-[13px] text-[#4D5B47] hover:pl-2 transition-all duration-200"
                >
                  View All Categories
                </motion.button>
              )}
              <div className="h-4" />
            </>
          )}

          {loading && (
            <div className="space-y-3 py-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-10 animate-pulse bg-[#E8E8E8] rounded-sm" />
              ))}
            </div>
          )}

          {/* Divider */}
          <div className="h-4" />

          {/* Secondary links */}
          {[
            { label: isAuthenticated ? (userName || "My Account") : "My Account", page: "account" as const, icon: <User className="w-4 h-4" strokeWidth={1.5} /> },
            { label: "Wishlist", page: "wishlist" as const, icon: <Heart className="w-4 h-4" strokeWidth={1.5} />, count: wishlistItems.length },
            { label: "Cart", page: "shop" as const, icon: <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />, count: cartCount, action: "cart" as const },
            { label: "Help & Support", page: "home" as const, icon: null },
          ].map((item, i) => (
            <motion.button suppressHydrationWarning
              key={item.label}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 + 0.35 }}
              onClick={() => {
                if (item.action === "cart") {
                  useStore.getState().toggleCart();
                } else if (!isAuthenticated && item.page === "account") {
                  setAuthOpen(true);
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
                <span suppressHydrationWarning className="text-[11px] text-[#999] bg-[#E8E8E8] px-2 py-0.5 font-medium">
                  {item.count}
                </span>
              )}
            </motion.button>
          ))}

          {/* Mobile auth action */}
          {!isAuthenticated && (
            <motion.button suppressHydrationWarning
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              onClick={() => { setAuthOpen(true); setMobileMenuOpen(false); }}
              className="group flex items-center w-full text-left py-3 text-[14px] text-[#4D5B47] border-b border-[#E8E8E8] hover:pl-2 transition-all duration-200 font-medium"
            >
              Sign In
            </motion.button>
          )}

          {isAuthenticated && (
            <motion.button suppressHydrationWarning
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55 }}
              onClick={handleLogout}
              className="group flex items-center gap-3 w-full text-left py-3 text-[14px] text-[#999] border-b border-[#E8E8E8] hover:text-[#C53030] hover:pl-2 transition-all duration-200"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Sign Out
            </motion.button>
          )}
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
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="9" />
                <path d="M9 18c.5-1.5 1.5-3.5 1.5-5a2 2 0 1 1 2 2c-1 0-1.5-.5-1.5-1.5a4 4 0 1 1 4 4c-2.5 0-4-1.5-4-4 0-1.5.5-3 1.5-4.5" />
              </svg>
            </a>
          </div>

          <p className="mt-4 text-[11px] text-[#999] tracking-wide">
            © {new Date().getFullYear()} {BRAND_NAME}. All rights reserved.
          </p>
        </div>
      </motion.div>
    </>
  );
}