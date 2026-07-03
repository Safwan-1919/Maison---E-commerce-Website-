"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { useAuth } from "@/components/auth/AuthProvider";
import { ProductCard } from "@/components/shared/ProductCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import {
  ArrowLeft, Heart, ShoppingBag, Truck, RotateCcw, Shield,
  ChevronDown, ChevronRight, ChevronLeft, Minus, Plus, Ruler, X, Lock
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number;
  image: string;
  category: string;
  brand: string;
  sizes: string;
  colors: string;
  images: string;
  rating: number;
  reviewCount: number;
  stock: number;
  isNew: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
  discount: number;
  material: string | null;
  care: string | null;
  tags: string | null;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
}

/* ───────────────────────── SVG Star Rating ───────────────────────── */

const STAR_PATH = "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

function StarRating({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => {
        const val = i + 1;
        const isFull = val <= Math.floor(rating);
        const isHalf = !isFull && val === Math.ceil(rating) && rating % 1 >= 0.25;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isHalf ? (
              <>
                <path d={STAR_PATH} fill="#E8E8E8" />
                <path
                  d={STAR_PATH}
                  fill="#B79B7B"
                  style={{ clipPath: "inset(0 50% 0 0)" }}
                />
              </>
            ) : (
              <path
                d={STAR_PATH}
                fill={isFull ? "#B79B7B" : "#E8E8E8"}
              />
            )}
          </svg>
        );
      })}
    </div>
  );
}

/* ───────────────────────── Relative Time ───────────────────────── */

function getRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diffMs = now - date;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 21) return "2 weeks ago";
  if (diffDays < 30) return "3 weeks ago";
  if (diffDays < 45) return "1 month ago";
  if (diffDays < 75) return "2 months ago";
  if (diffDays < 105) return "3 months ago";
  if (diffDays < 195) return "6 months ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

/* ───────────────────── Rating Distribution ───────────────────── */

function getRatingDistribution(reviews: Review[]) {
  const dist = [0, 0, 0, 0, 0]; // index 0 = 5 stars, index 4 = 1 star
  reviews.forEach((r) => {
    const star = Math.round(r.rating);
    if (star >= 1 && star <= 5) dist[5 - star]++;
  });
  const total = reviews.length || 1;
  return dist.map((count) => ({
    count,
    pct: Math.round((count / total) * 100),
  }));
}

/* ───────────────────────── Skeleton ───────────────────────── */

function ProductSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
        <div className="aspect-[3/4] bg-[#F0EFED] rounded-[4px]" />
        <div className="space-y-4">
          <div className="h-3 w-24 bg-[#F0EFED] rounded-[4px]" />
          <div className="h-8 w-3/4 bg-[#F0EFED] rounded-[4px]" />
          <div className="h-4 w-48 bg-[#F0EFED] rounded-[4px]" />
          <div className="h-6 w-32 bg-[#F0EFED] rounded-[4px]" />
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────── Image Gallery ─────────────────────── */

function ImageGallery({
  images,
  productName,
  onImageClick,
}: {
  images: string[];
  productName: string;
  onImageClick?: (index: number) => void;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="space-y-3">
      {/* Main Image */}
      <div
        className="relative aspect-[3/4] bg-[#F0EFED] overflow-hidden cursor-zoom-in"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
        onClick={() => onImageClick?.(activeIndex)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0"
          >
            <img
              src={images[activeIndex]}
              alt={`${productName} - Image ${activeIndex + 1}`}
              className="w-full h-full object-cover transition-transform duration-300"
              style={
                zoomed
                  ? {
                      transform: "scale(1.8)",
                      transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                    }
                  : {}
              }
            />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-3 py-1">
            <span className="text-[11px] text-white font-medium">
              {activeIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-20 border-2 overflow-hidden transition-all ${
                i === activeIndex
                  ? "border-[#111]"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─────────────────── Collapsible Section ──────────────────── */

function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  isOpen,
  onToggle,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen);

  const isControlled = isOpen !== undefined;
  const open = isControlled ? isOpen : internalOpen;

  const toggle = () => {
    const next = !open;
    if (isControlled && onToggle) {
      onToggle(next);
    } else if (!isControlled) {
      setInternalOpen(next);
    }
  };

  return (
    <div className="border-b border-[#E8E8E8]">
      <button
        onClick={toggle}
        className="flex items-center justify-between w-full py-4 text-[13px] font-medium tracking-wide text-[#111] hover:text-[#666] transition-colors"
      >
        {title}
        {open ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─────────────────── Review Form ──────────────────── */

function ReviewForm({
  productId,
  onSubmit,
  submitting,
}: {
  productId: string;
  onSubmit: (data: { rating: number; title: string; comment: string }) => void;
  submitting: boolean;
}) {
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRating === 0) return;
    onSubmit({ rating: selectedRating, title, comment });
    setSelectedRating(0);
    setTitle("");
    setComment("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border border-[#E8E8E8] bg-white p-5 rounded-[4px]">
      <h3 className="text-[14px] font-medium text-[#111]">Write a Review</h3>

      {/* Star selector */}
      <div>
        <p className="text-[12px] text-[#999] mb-2">Your Rating</p>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setSelectedRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-0.5 transition-transform hover:scale-110"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path
                  d={STAR_PATH}
                  fill={star <= (hoverRating || selectedRating) ? "#B79B7B" : "#E8E8E8"}
                />
              </svg>
            </button>
          ))}
          {selectedRating > 0 && (
            <span className="text-[12px] text-[#999] ml-2">
              {selectedRating === 1 ? "Poor" : selectedRating === 2 ? "Fair" : selectedRating === 3 ? "Good" : selectedRating === 4 ? "Very Good" : "Excellent"}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Review title (optional)"
          className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8E8] bg-transparent focus:outline-none focus:border-[#111] transition-colors placeholder:text-[#bbb]"
        />
      </div>

      {/* Comment */}
      <div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product (optional)"
          rows={3}
          className="w-full px-3 py-2.5 text-[13px] border border-[#E8E8E8] bg-transparent focus:outline-none focus:border-[#111] transition-colors resize-none placeholder:text-[#bbb]"
        />
      </div>

      <button
        type="submit"
        disabled={selectedRating === 0 || submitting}
        className="px-6 py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}

/* ═══════════════════════ MAIN COMPONENT ═══════════════════════ */

export default function ProductPage() {
  const {
    selectedProductId,
    navigate,
    goBack,
    addToCart,
    toggleWishlist,
    isInWishlist,
    addToRecentlyViewed,
    setSizeGuideOpen,
    showNotification,
    setAuthOpen,
  } = useStore();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [openDetail, setOpenDetail] = useState<string | null>("description");

  // Review state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewTotal, setReviewTotal] = useState(0);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchProduct = useCallback(async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}`);
      const data = await res.json();
      setProduct(data.product);
      setSimilar(data.similarProducts || []);
      // Set initial reviews from the product response
      setReviews(data.product?.reviews || []);
      setReviewTotal(data.product?.reviewCount || 0);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [selectedProductId]);

  const fetchReviews = useCallback(async (pageNum: number, append: boolean = false) => {
    if (!selectedProductId) return;
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}/reviews?page=${pageNum}&limit=5`);
      const data = await res.json();
      if (append) {
        setReviews((prev) => [...prev, ...(data.reviews || [])]);
      } else {
        setReviews(data.reviews || []);
      }
      setReviewTotal(data.total || 0);
      setReviewTotalPages(data.totalPages || 1);
      setReviewPage(data.page || 1);
    } catch (e) {
      console.error(e);
    }
    setReviewsLoading(false);
  }, [selectedProductId]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Fetch reviews when product loads (use API pagination)
  useEffect(() => {
    if (product) {
      setReviewPage(1);
      fetchReviews(1, false);
    }
  }, [product]);

  // Escape key to close lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen]);

  // Track recently viewed
  useEffect(() => {
    if (product) {
      const timer = setTimeout(() => {
        addToRecentlyViewed(product.id);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [product, addToRecentlyViewed]);

  // Set default size/color when product loads
  useEffect(() => {
    if (product) {
      try {
        const sizes: string[] = JSON.parse(product.sizes || "[]");
        const colors: string[] = JSON.parse(product.colors || "[]");
        if (!selectedSize && sizes.length > 0 && sizes[0] !== "ONE SIZE") {
          setSelectedSize(sizes[Math.min(2, sizes.length - 1)]);
        }
        if (!selectedColor && colors.length > 0) {
          setSelectedColor(colors[0]);
        }
      } catch {
        // ignore parse errors
      }
    }
  }, [product]);

  // Handle review submission
  const handleReviewSubmit = async (data: { rating: number; title: string; comment: string }) => {
    if (!selectedProductId || !isAuthenticated) return;
    setSubmittingReview(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          rating: data.rating,
          title: data.title || undefined,
          comment: data.comment || undefined,
        }),
      });
      if (res.ok) {
        showNotification("Review submitted successfully", "success");
        // Re-fetch reviews from page 1
        fetchReviews(1, false);
        // Re-fetch product to update rating/reviewCount
        fetchProduct();
      } else {
        const err = await res.json().catch(() => ({}));
        showNotification(err.error || "Failed to submit review", "error");
      }
    } catch {
      showNotification("Failed to submit review", "error");
    }
    setSubmittingReview(false);
  };

  if (loading)
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-20">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ProductSkeleton />
        </div>
      </main>
    );
  if (!product)
    return (
      <main className="min-h-screen bg-[#F8F8F6] pt-20 flex items-center justify-center">
        <p className="text-[15px] text-[#666]">Product not found</p>
      </main>
    );

  const images: string[] = JSON.parse(product.images || "[]");
  const sizes: string[] = JSON.parse(product.sizes || "[]");
  const colors: string[] = JSON.parse(product.colors || "[]");
  const inWishlist = isInWishlist(product.id);

  // Delivery dates: 5-7 business days (approx 7-9 calendar days)
  const deliveryMinDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const deliveryMaxDate = new Date(Date.now() + 9 * 24 * 60 * 60 * 1000);
  const deliveryMinStr = deliveryMinDate.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  const deliveryMaxStr = deliveryMaxDate.toLocaleDateString("en-IN", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });

  // Rating distribution
  const distribution = reviews.length > 0
    ? getRatingDistribution(reviews)
    : [
        { count: 0, pct: 0 },
        { count: 0, pct: 0 },
        { count: 0, pct: 0 },
        { count: 0, pct: 0 },
        { count: 0, pct: 0 },
      ];

  // Detail tabs
  const detailTabs = [
    { id: "description", label: "Description" },
    { id: "material", label: "Material & Care" },
    { id: "shipping", label: "Shipping" },
  ];

  const handleAddToCart = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: images[0],
      size: selectedSize || sizes[0] || "M",
      color: selectedColor || colors[0] || "Default",
      quantity,
    });
  };

  const handleBuyNow = () => {
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: images[0],
      size: selectedSize || sizes[0] || "M",
      color: selectedColor || colors[0] || "Default",
      quantity,
    });
    navigate("checkout");
  };

  return (
    <main className="min-h-screen bg-[#F8F8F6] pt-20 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <ScrollReveal>
          <nav className="flex items-center gap-2 py-4 text-[12px] text-[#999]">
            <button
              onClick={() => navigate("home")}
              className="hover:text-[#111] transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-3 h-3" />
            <button
              onClick={() => navigate("shop")}
              className="hover:text-[#111] transition-colors"
            >
              {product.category}
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#111] truncate max-w-[200px]">
              {product.name}
            </span>
          </nav>
        </ScrollReveal>

        {/* Back Button */}
        <button
          onClick={goBack}
          className="flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors mb-6"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>

        {/* Product Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Gallery */}
          <ScrollReveal direction="left">
            <ImageGallery
              images={images}
              productName={product.name}
              onImageClick={(i) => {
                setLightboxIndex(i);
                setLightboxOpen(true);
              }}
            />
          </ScrollReveal>

          {/* Product Info */}
          <ScrollReveal direction="right">
            <div className="space-y-6">
              {/* Brand */}
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999]">
                {product.brand}
              </p>

              {/* Name */}
              <h1 className="text-[24px] sm:text-[28px] lg:text-[32px] font-medium tracking-[-0.02em] text-[#111] leading-tight">
                {product.name}
              </h1>

              {/* Rating — Enhanced Star Display */}
              <div className="flex items-center gap-3">
                <StarRating rating={product.rating} size={16} />
                <span className="text-[14px] font-medium text-[#111]">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-[13px] text-[#999]">
                  ({product.reviewCount} reviews)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-[24px] sm:text-[28px] font-medium text-[#111]">
                  {"\u20B9"}
                  {product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-[16px] text-[#999] line-through">
                      {"\u20B9"}
                      {product.mrp.toLocaleString("en-IN")}
                    </span>
                    <span className="px-2 py-0.5 bg-[#F0EFED] text-[11px] font-medium tracking-wide text-[#111]">
                      {product.discount}% OFF
                    </span>
                  </>
                )}
              </div>

              {/* Short Description */}
              {product.description && (
                <p className="text-[14px] text-[#666] leading-relaxed">
                  {product.description.length > 200
                    ? product.description.slice(0, 200) + "..."
                    : product.description}
                </p>
              )}

              <div className="border-t border-[#E8E8E8]" />

              {/* Color Selection */}
              {colors.length > 0 && (
                <div>
                  <p className="text-[12px] font-medium tracking-wider uppercase text-[#111] mb-3">
                    Color:{" "}
                    <span className="text-[#999] font-normal normal-case tracking-normal">
                      {selectedColor}
                    </span>
                  </p>
                  <div className="flex items-center gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 border-2 transition-all ${
                          selectedColor === color
                            ? "border-[#111] scale-110"
                            : "border-[#E8E8E8] hover:border-[#999]"
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              {sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[12px] font-medium tracking-wider uppercase text-[#111]">
                      Size:{" "}
                      <span className="text-[#999] font-normal normal-case tracking-normal">
                        {selectedSize || "Select"}
                      </span>
                    </p>
                    {sizes[0] !== "ONE SIZE" && (
                      <button
                        onClick={() => setSizeGuideOpen(true)}
                        className="flex items-center gap-1 text-[11px] text-[#4D5B47] hover:text-[#111] transition-colors"
                      >
                        <Ruler className="w-3 h-3" /> Size Guide
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`min-w-[44px] h-11 px-3 text-[13px] border transition-all flex items-center justify-center ${
                          selectedSize === size
                            ? "bg-[#111] text-[#F8F8F6] border-[#111]"
                            : "border-[#E8E8E8] text-[#333] hover:border-[#999]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div>
                <p className="text-[12px] font-medium tracking-wider uppercase text-[#111] mb-3">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-[#E8E8E8]">
                  <button
                    onClick={() =>
                      setQuantity(Math.max(1, quantity - 1))
                    }
                    className="w-11 h-11 flex items-center justify-center hover:bg-[#F0EFED] transition-colors"
                  >
                    <Minus
                      className="w-3.5 h-3.5"
                      strokeWidth={1.5}
                    />
                  </button>
                  <span className="w-12 text-center text-[14px] font-medium">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="w-11 h-11 flex items-center justify-center hover:bg-[#F0EFED] transition-colors"
                  >
                    <Plus
                      className="w-3.5 h-3.5"
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <p className="text-[12px] text-[#C53030] mt-2">
                    Only {product.stock} left in stock
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Bag
                </button>
                <div className="flex gap-3">
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 border border-[#111] text-[#111] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#111] hover:text-[#F8F8F6] transition-all"
                  >
                    Buy Now
                  </button>
                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`w-12 h-12 border flex items-center justify-center transition-all ${
                      inWishlist
                        ? "border-[#111] bg-[#111]"
                        : "border-[#E8E8E8] hover:border-[#999]"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        inWishlist ? "text-[#F8F8F6]" : "text-[#111]"
                      }`}
                      fill={inWishlist ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>

              {/* ──────── Delivery Info — Enhanced ──────── */}
              <div className="border-t border-b border-[#E8E8E8] py-4 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 bg-[#F0EFED] rounded-[4px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Truck
                      className="w-4 h-4 text-[#4D5B47]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] text-[#111]">
                      Estimated delivery:{" "}
                      <span className="font-medium">
                        {deliveryMinStr} – {deliveryMaxStr}
                      </span>
                    </p>
                    <p className="text-[11px] text-[#999] mt-0.5">
                      5–7 business days &middot; Free on orders over{" "}
                      {"\u20B9"}2,000
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 bg-[#F0EFED] rounded-[4px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <RotateCcw
                      className="w-4 h-4 text-[#4D5B47]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] text-[#111]">
                      Free returns within 30 days
                    </p>
                    <p className="text-[11px] text-[#999] mt-0.5">
                      No questions asked &middot; Free return shipping on
                      orders over {"\u20B9"}5,000
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 bg-[#F0EFED] rounded-[4px] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield
                      className="w-4 h-4 text-[#4D5B47]"
                      strokeWidth={1.5}
                    />
                  </div>
                  <div>
                    <p className="text-[13px] text-[#111]">
                      100% authentic products
                    </p>
                    <p className="text-[11px] text-[#999] mt-0.5">
                      Sourced directly from brands
                    </p>
                  </div>
                </div>
              </div>

              {/* ──────── Product Details — Tabbed Accordion ──────── */}
              <div>
                {/* Tab navigation bar */}
                <div className="flex border-b border-[#E8E8E8]">
                  {detailTabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() =>
                        setOpenDetail(
                          openDetail === tab.id ? null : tab.id
                        )
                      }
                      className={`px-4 sm:px-5 py-3.5 text-[12px] sm:text-[13px] font-medium tracking-wide transition-colors border-b-2 -mb-px ${
                        openDetail === tab.id
                          ? "text-[#111] border-[#4D5B47]"
                          : "text-[#999] border-transparent hover:text-[#666]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Collapsible sections — controlled by tab state */}
                <CollapsibleSection
                  title="Description & Fit"
                  isOpen={openDetail === "description"}
                  onToggle={(open) =>
                    setOpenDetail(open ? "description" : null)
                  }
                >
                  <p className="text-[14px] text-[#666] leading-relaxed">
                    {product.description}
                  </p>
                </CollapsibleSection>

                <CollapsibleSection
                  title="Material & Care"
                  isOpen={openDetail === "material"}
                  onToggle={(open) =>
                    setOpenDetail(open ? "material" : null)
                  }
                >
                  {product.material && (
                    <p className="text-[13px] text-[#666] mb-2">
                      <span className="text-[#111] font-medium">
                        Material:
                      </span>{" "}
                      {product.material}
                    </p>
                  )}
                  {product.care && (
                    <p className="text-[13px] text-[#666]">
                      <span className="text-[#111] font-medium">
                        Care:
                      </span>{" "}
                      {product.care}
                    </p>
                  )}
                </CollapsibleSection>

                <CollapsibleSection
                  title="Shipping & Returns"
                  isOpen={openDetail === "shipping"}
                  onToggle={(open) =>
                    setOpenDetail(open ? "shipping" : null)
                  }
                >
                  <div className="space-y-2 text-[13px] text-[#666]">
                    <p>
                      Free shipping on orders over {"\u20B9"}2,000
                    </p>
                    <p>Standard delivery: 5–7 business days</p>
                    <p>
                      Express delivery: 1–2 business days (
                      {"\u20B9"}299)
                    </p>
                    <p>Free returns within 30 days</p>
                    <p>
                      Free return shipping on orders over {"\u20B9"}
                      5,000
                    </p>
                  </div>
                </CollapsibleSection>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* ═══════════════ Reviews Section — Enhanced ═══════════════ */}
        <section className="mt-16 lg:mt-24">
          <ScrollReveal>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
              <div>
                <h2 className="text-[24px] sm:text-[28px] font-medium tracking-[-0.02em]">
                  Reviews
                </h2>
                <p className="text-[13px] text-[#999] mt-1">
                  {reviewTotal} reviews
                </p>
              </div>
              <div className="flex items-center gap-5">
                {/* Average rating summary */}
                {reviews.length > 0 && (
                  <div className="flex items-center gap-2.5">
                    <span className="text-[32px] font-medium text-[#111] leading-none">
                      {product.rating.toFixed(1)}
                    </span>
                    <div>
                      <StarRating
                        rating={product.rating}
                        size={14}
                      />
                      <p className="text-[11px] text-[#999] mt-0.5">
                        Average rating
                      </p>
                    </div>
                  </div>
                )}

                {/* Write a Review — Auth-aware */}
                {isAuthenticated ? null : (
                  <button
                    onClick={() => setAuthOpen(true)}
                    className="inline-flex items-center gap-2 text-[#666] text-[12px] tracking-wide px-5 py-2.5 border border-[#E8E8E8] hover:border-[#999] hover:text-[#111] transition-colors rounded-[4px]"
                  >
                    <Lock className="w-3.5 h-3.5" strokeWidth={1.5} />
                    Sign in to review
                  </button>
                )}
              </div>
            </div>
          </ScrollReveal>

          {/* Review Form (only if authenticated) */}
          {isAuthenticated && (
            <div className="mb-8">
              <ReviewForm
                productId={product.id}
                onSubmit={handleReviewSubmit}
                submitting={submittingReview}
              />
            </div>
          )}

          {/* Rating Distribution + Reviews Grid */}
          {reviews.length > 0 && (
            <div className="grid lg:grid-cols-[220px_1fr] gap-8 lg:gap-12">
              {/* Distribution sidebar */}
              <ScrollReveal>
                <div className="space-y-2.5 lg:sticky lg:top-24">
                  {[5, 4, 3, 2, 1].map((star, i) => (
                    <div
                      key={star}
                      className="flex items-center gap-2 text-[12px]"
                    >
                      <span className="w-3.5 text-right text-[#666] tabular-nums">
                        {star}
                      </span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d={STAR_PATH}
                          fill="#B79B7B"
                        />
                      </svg>
                      <div className="flex-1 h-[6px] bg-[#F0EFED] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#B79B7B] rounded-full transition-all duration-500"
                          style={{
                            width: `${distribution[i].pct}%`,
                          }}
                        />
                      </div>
                      <span className="w-6 text-right text-[#999] tabular-nums">
                        {distribution[i].count}
                      </span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>

              {/* Reviews list */}
              <div className="space-y-0">
                {reviews.map((review, i) => (
                  <ScrollReveal
                    key={review.id}
                    delay={i * 0.05}
                  >
                    <div className="border-t border-[#E8E8E8] py-5 first:pt-0">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#F0EFED] rounded-full flex items-center justify-center text-[12px] font-medium text-[#666]">
                            {review.userName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-[13px] font-medium text-[#111]">
                              {review.userName}
                            </p>
                            <p className="text-[11px] text-[#999]">
                              {getRelativeTime(review.createdAt)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Verified Purchase Badge */}
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#4D5B47] font-medium tracking-wide uppercase">
                            <svg
                              width="12"
                              height="12"
                              viewBox="0 0 12 12"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="6"
                                cy="6"
                                r="6"
                                fill="#EAF0E7"
                              />
                              <path
                                d="M3.5 6L5.25 7.75L8.5 4.5"
                                stroke="#4D5B47"
                                strokeWidth="1.1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                            Verified
                          </span>
                          <StarRating
                            rating={review.rating}
                            size={12}
                          />
                        </div>
                      </div>
                      {review.title && (
                        <p className="text-[14px] font-medium text-[#111] mb-1">
                          {review.title}
                        </p>
                      )}
                      {review.comment && (
                        <p className="text-[13px] text-[#666] leading-relaxed">
                          {review.comment}
                        </p>
                      )}
                    </div>
                  </ScrollReveal>
                ))}

                {/* Load More Reviews */}
                {reviewPage < reviewTotalPages && (
                  <div className="pt-6">
                    <button
                      onClick={() => fetchReviews(reviewPage + 1, true)}
                      disabled={reviewsLoading}
                      className="w-full py-3 border border-[#E8E8E8] text-[12px] tracking-widest uppercase text-[#111] hover:border-[#999] hover:bg-[#F0EFED] transition-colors disabled:opacity-50"
                    >
                      {reviewsLoading ? "Loading..." : "Load More Reviews"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Empty reviews state */}
          {reviews.length === 0 && (
            <div className="text-center py-12 border border-[#E8E8E8] bg-white">
              <StarRating rating={0} size={28} />
              <p className="text-[14px] text-[#999] mt-4">
                No reviews yet. Be the first to share your thoughts.
              </p>
            </div>
          )}
        </section>

        {/* Similar Products */}
        {similar.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <ScrollReveal>
              <h2 className="text-[24px] sm:text-[28px] font-medium tracking-[-0.02em] mb-8">
                You May Also Like
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
              {similar.slice(0, 4).map((p, i) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  price={p.price}
                  mrp={p.mrp}
                  image={p.image}
                  images={
                    p.images
                      ? JSON.parse(p.images)
                      : undefined
                  }
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
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors rounded"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Counter */}
            <div className="absolute top-4 left-4 text-white/60 text-[12px] tracking-wider">
              {lightboxIndex + 1} / {images.length}
            </div>

            {/* Left arrow */}
            {lightboxIndex > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex - 1);
                }}
                className="absolute left-4 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors rounded"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Right arrow */}
            {lightboxIndex < images.length - 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(lightboxIndex + 1);
                }}
                className="absolute right-4 w-10 h-10 bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors rounded"
                aria-label="Next image"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}

            {/* Image */}
            <img
              key={lightboxIndex}
              src={images[lightboxIndex]}
              alt={`${product.name} - Image ${lightboxIndex + 1}`}
              className="max-h-[85vh] max-w-[85vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}