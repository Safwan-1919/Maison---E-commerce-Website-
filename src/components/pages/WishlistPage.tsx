"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { BRAND_NAME } from "@/lib/constants";
import { ProductCard } from "@/components/shared/ProductCard";
import {
  Heart,
  ChevronRight,
  Share2,
  Check,
  ChevronDown,
  Copy,
  MessageCircle,
  Mail,
  ShoppingBag,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  images?: string;
  sizes?: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  discount: number;
  isNew: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
}

const sortOptions = [
  { label: "Recently Added", value: "recent" },
  { label: "Price: Low to High", value: "price-low" },
  { label: "Price: High to Low", value: "price-high" },
  { label: "Discount", value: "discount" },
];

export default function WishlistPage() {
  const { wishlistItems, navigate, toggleWishlist, addToCart, syncWishlistFromDB } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [shareOpen, setShareOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [sortBy, setSortBy] = useState("recent");

  // Sync wishlist from DB on mount
  useEffect(() => {
    syncWishlistFromDB();
  }, [syncWishlistFromDB]);

  // Fetch wishlist products from DB API
  useEffect(() => {
    if (wishlistItems.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((data) => {
        const items = (data.wishlistItems || []).map((item: { product: Product }) => item.product);
        setProducts(items);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [wishlistItems]);

  const sortedProducts = useMemo(() => {
    const sorted = [...products];
    switch (sortBy) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "discount":
        sorted.sort((a, b) => b.discount - a.discount);
        break;
      // "recent" — already in wishlist order
      default:
        break;
    }
    return sorted;
  }, [products, sortBy]);

  const stats = useMemo(() => {
    const totalItems = products.length;
    const totalValue = products.reduce((sum, p) => sum + p.price, 0);
    const avgDiscount =
      totalItems > 0
        ? Math.round(
            products.reduce((sum, p) => sum + p.discount, 0) / totalItems
          )
        : 0;
    return { totalItems, totalValue, avgDiscount };
  }, [products]);

  const handleCopyLink = async () => {
    const realUrl = typeof window !== "undefined" ? window.location.href : "";
    try {
      await navigator.clipboard.writeText(realUrl);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = realUrl;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareUrl = encodeURIComponent(typeof window !== "undefined" ? window.location.href : "");
  const shareText = encodeURIComponent(
    `Check out my ${BRAND_NAME} wishlist — curated pieces I love!`
  );

  const currentSortLabel =
    sortOptions.find((o) => o.value === sortBy)?.label ?? "Sort";

  return (
    <motion.main
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="min-h-screen bg-[#F8F8F6] pt-4 pb-16"
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-4 text-[12px] text-[#999]">
          <button suppressHydrationWarning
            onClick={() => navigate("home")}
            className="hover:text-[#111] transition-colors"
          >
            Home
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#111]">Wishlist</span>
        </nav>

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">
              Wishlist
            </h1>
            <p className="text-[14px] text-[#999] mt-1">
              {wishlistItems.length} item
              {wishlistItems.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <div className="flex items-center gap-4">
              <button suppressHydrationWarning
                onClick={() => setShareOpen(true)}
                className="flex items-center gap-2 text-[12px] text-[#999] hover:text-[#111] transition-colors tracking-wide uppercase"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <button suppressHydrationWarning
                onClick={() => {
                  if (window.confirm("Remove all items from your wishlist?")) {
                    wishlistItems.forEach((id) => toggleWishlist(id));
                  }
                }}
                className="text-[12px] text-[#999] hover:text-[#C53030] transition-colors tracking-wide uppercase"
              >
                Clear All
              </button>
            </div>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] skeleton-shimmer rounded-[4px]" />
                <div className="h-3 w-16 skeleton-shimmer rounded-[4px]" />
                <div className="h-4 w-full skeleton-shimmer rounded-[4px]" />
                <div className="h-4 w-20 skeleton-shimmer rounded-[4px]" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          /* ── Empty State ── */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart
              className="w-16 h-16 text-[#D1D1D1] mb-6"
              strokeWidth={1}
            />
            <h2 className="text-[24px] font-medium tracking-[-0.02em] mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-[14px] text-[#999] mb-8">
              Save items you love for later
            </p>
            <button suppressHydrationWarning
              onClick={() => navigate("shop")}
              className="px-8 py-3.5 bg-[#4D5B47] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#3d4a39] transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <>
            {/* ── Stats Bar ── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-0 mb-8 border border-[#E8E8E8] rounded-[4px] bg-white overflow-hidden"
            >
              {[
                {
                  label: "Total Items",
                  value: stats.totalItems.toString(),
                },
                {
                  label: "Total Value",
                  value: `₹${stats.totalValue.toLocaleString("en-IN")}`,
                },
                {
                  label: "Avg. Discount",
                  value: `${stats.avgDiscount}%`,
                },
              ].map((stat, idx) => (
                <div
                  key={stat.label}
                  className={`flex-1 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-0.5 sm:gap-2 ${
                    idx < 2 ? "border-r border-[#E8E8E8]" : ""
                  }`}
                >
                  <span className="text-[11px] text-[#999] tracking-wide uppercase">
                    {stat.label}
                  </span>
                  <span className="text-[14px] font-medium text-[#111]">
                    {stat.value}
                  </span>
                </div>
              ))}
            </motion.div>

            {/* ── Sort Bar ── */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-[13px] text-[#999]">
                Showing {sortedProducts.length} item
                {sortedProducts.length !== 1 ? "s" : ""}
              </p>
              <div className="relative">
                <button suppressHydrationWarning
                  onClick={() => setSortOpen(!sortOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-[#E8E8E8] text-[12px] tracking-wide uppercase hover:border-[#999] transition-colors"
                >
                  <ChevronDown className="w-3 h-3" />
                  <span className="hidden sm:inline">{currentSortLabel}</span>
                </button>
                <AnimatePresence>
                  {sortOpen && (
                    <>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70]"
                        onClick={() => setSortOpen(false)}
                      />
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="absolute right-0 top-full mt-1 z-[80] bg-white border border-[#E8E8E8] shadow-lg min-w-[200px] py-1"
                      >
                        {sortOptions.map((opt) => (
                          <button suppressHydrationWarning
                            key={opt.value}
                            onClick={() => {
                              setSortBy(opt.value);
                              setSortOpen(false);
                            }}
                            className={`block w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                              sortBy === opt.value
                                ? "text-[#4D5B47] font-medium"
                                : "text-[#666] hover:text-[#111]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* ── Product Grid ── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              <AnimatePresence>
                {sortedProducts.map((p, i) => (
                  <div key={p.id}>
                    <ProductCard
                      id={p.id}
                      name={p.name}
                      price={p.price}
                      mrp={p.mrp}
                      image={p.image}
                      images={p.images ? JSON.parse(p.images) : undefined}
                      category={p.category}
                      brand={p.brand}
                      rating={p.rating}
                      reviewCount={p.reviewCount}
                      discount={p.discount}
                      isNew={p.isNew}
                      isTrending={p.isTrending}
                      isBestSeller={p.isBestSeller}
                      index={i}
                    />
                    <button suppressHydrationWarning
                      onClick={() => {
                        const sizes = p.sizes ? JSON.parse(p.sizes) : ["S", "M", "L", "XL"];
                        addToCart({
                          productId: p.id,
                          name: p.name,
                          price: p.price,
                          mrp: p.mrp,
                          image: p.image,
                          size: sizes[0] || "M",
                          color: "",
                          quantity: 1,
                        });
                        toggleWishlist(p.id);
                      }}
                      className="w-full mt-2 py-2 flex items-center justify-center gap-2 text-[11px] tracking-widest uppercase text-[#666] border border-[#E8E8E8] hover:bg-[#111] hover:text-[#F8F8F6] hover:border-[#111] transition-colors"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" strokeWidth={1.5} />
                      Move to Cart
                    </button>
                  </div>
                ))}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* ── Share Modal ── */}
      <AnimatePresence>
        {shareOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[90] bg-black/40"
              onClick={() => setShareOpen(false)}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ duration: 0.25, ease: [0.19, 1, 0.22, 1] }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, delay: 0.05 }}
                className="bg-[#F8F8F6] border border-[#E8E8E8] rounded-[4px] w-full max-w-[400px] shadow-xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[#E8E8E8]">
                  <h3 className="text-[16px] font-medium tracking-[-0.01em]">
                    Share Your Wishlist
                  </h3>
                  <button suppressHydrationWarning
                    onClick={() => setShareOpen(false)}
                    className="w-8 h-8 flex items-center justify-center text-[#999] hover:text-[#111] transition-colors"
                  >
                    ×
                  </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-5">
                  {/* Copy Link */}
                  <div>
                    <p className="text-[12px] text-[#999] tracking-wide uppercase mb-2">
                      Wishlist Link
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 px-3 py-2.5 bg-white border border-[#E8E8E8] rounded-[4px] text-[13px] text-[#666] truncate font-mono">
                        {typeof window !== "undefined" ? window.location.host + window.location.pathname : ""}
                      </div>
                      <motion.button suppressHydrationWarning
                        whileTap={{ scale: 0.95 }}
                        onClick={handleCopyLink}
                        className={`flex items-center gap-1.5 px-4 py-2.5 text-[12px] tracking-wide uppercase font-medium transition-all duration-200 rounded-[4px] ${
                          copied
                            ? "bg-[#4D5B47] text-[#F8F8F6]"
                            : "bg-[#111] text-[#F8F8F6] hover:bg-[#333]"
                        }`}
                      >
                        {copied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            Copy Link
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#E8E8E8]" />

                  {/* Social Share */}
                  <div>
                    <p className="text-[12px] text-[#999] tracking-wide uppercase mb-3">
                      Share Via
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                      {/* WhatsApp */}
                      <a
                        href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 px-3 py-3.5 border border-[#E8E8E8] rounded-[4px] hover:border-[#999] transition-colors"
                      >
                        <MessageCircle className="w-5 h-5 text-[#111]" />
                        <span className="text-[11px] tracking-wide uppercase text-[#666]">
                          WhatsApp
                        </span>
                      </a>

                      {/* Twitter / X */}
                      <a
                        href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex flex-col items-center gap-2 px-3 py-3.5 border border-[#E8E8E8] rounded-[4px] hover:border-[#999] transition-colors"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          className="w-5 h-5 text-[#111]"
                        >
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                        </svg>
                        <span className="text-[11px] tracking-wide uppercase text-[#666]">
                          Twitter
                        </span>
                      </a>

                      {/* Email */}
                      <a
                        href={`mailto:?subject=${encodeURIComponent(`My ${BRAND_NAME} Wishlist`)}&body=${shareText}%0A%0A${shareUrl}`}
                        className="flex flex-col items-center gap-2 px-3 py-3.5 border border-[#E8E8E8] rounded-[4px] hover:border-[#999] transition-colors"
                      >
                        <Mail className="w-5 h-5 text-[#111]" />
                        <span className="text-[11px] tracking-wide uppercase text-[#666]">
                          Email
                        </span>
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.main>
  );
}