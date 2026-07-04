"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, Minus, Plus, ShoppingBag, Eye } from "lucide-react";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { useStore } from "@/lib/store";

interface ProductData {
  id: string;
  name: string;
  price: number;
  mrp: number;
  category: string;
  brand: string;
  sizes: string;
  colors: string;
  images: string;
  rating: number;
  reviewCount: number;
  discount: number;
  stock: number;
  description: string | null;
  material: string | null;
  care: string | null;
}

const COLOR_MAP: Record<string, string> = {
  Black: "#111111",
  White: "#FFFFFF",
  Navy: "#1B2A4A",
  Beige: "#C8B99A",
  Brown: "#6B4226",
  Grey: "#8C8C8C",
  Charcoal: "#36454F",
  Olive: "#556B2F",
  Burgundy: "#800020",
  Cream: "#FFFDD0",
  Ivory: "#FFFFF0",
  Tan: "#D2B48C",
  Rust: "#B7410E",
  Sage: "#BCB88A",
  DustyRose: "#DCAE96",
  Emerald: "#50C878",
  Midnight: "#191970",
  Sand: "#C2B280",
  Espresso: "#3C1414",
};

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.25, 0.1, 0.25, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    y: 10,
    transition: { duration: 0.2, ease: [0.25, 0.1, 0.25, 1] },
  },
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className="w-3.5 h-3.5"
            fill={star <= Math.round(rating) ? "#111" : "none"}
            stroke="#111"
            strokeWidth={1.2}
          />
        ))}
      </div>
      <span className="text-[12px] text-[#666]">{rating}</span>
      <span className="text-[11px] text-[#999]">({count})</span>
    </div>
  );
}

function formatPrice(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function QuickViewModal() {
  const { quickViewProductId, setQuickViewProductId, addToCart, navigate } = useStore();
  const [product, setProduct] = useState<ProductData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [imgError, setImgError] = useState(false);

  const isOpen = quickViewProductId !== null;

  const fetchProduct = useCallback(async () => {
    if (!quickViewProductId) return;
    setLoading(true);
    setError(false);
    setImgError(false);
    setImageIndex(0);
    setQuantity(1);

    try {
      const res = await fetch(`/api/products/${quickViewProductId}`);
      if (!res.ok) {
        setError(true);
        return;
      }
      const data = await res.json();
      const p: ProductData = data.product;

      setProduct(p);

      // Set default selections
      try {
        const colors: string[] = JSON.parse(p.colors);
        if (colors.length > 0) setSelectedColor(colors[0]);
      } catch {
        setSelectedColor("Default");
      }
      try {
        const sizes: string[] = JSON.parse(p.sizes);
        if (sizes.length > 0) setSelectedSize(sizes.includes("M") ? "M" : sizes[0]);
      } catch {
        setSelectedSize("M");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [quickViewProductId]);

  useEffect(() => {
    if (quickViewProductId) {
      fetchProduct();
    } else {
      setProduct(null);
    }
  }, [quickViewProductId, fetchProduct]);

  const handleClose = () => {
    setQuickViewProductId(null);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleAddToBag = () => {
    if (!product) return;
    const images: string[] = JSON.parse(product.images);
    addToCart({
      productId: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: images[0] || "",
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
    handleClose();
  };

  const handleViewFullDetails = () => {
    if (!product) return;
    handleClose();
    navigate("product", product.id);
  };

  let parsedImages: string[] = [];
  let parsedColors: string[] = [];
  let parsedSizes: string[] = [];

  if (product) {
    try {
      parsedImages = JSON.parse(product.images);
    } catch {
      parsedImages = [];
    }
    try {
      parsedColors = JSON.parse(product.colors);
    } catch {
      parsedColors = [];
    }
    try {
      parsedSizes = JSON.parse(product.sizes);
    } catch {
      parsedSizes = [];
    }
  }

  const discountPercent = product ? Math.round(product.discount) : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={handleBackdropClick}
          style={{ backdropFilter: "blur(8px)" }}
        >
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-black/50" />

          {/* Modal content */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-[#F8F8F6] shadow-2xl"
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button suppressHydrationWarning
              onClick={handleClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 bg-[#F8F8F6] flex items-center justify-center hover:bg-white transition-colors shadow-sm"
              aria-label="Close quick view"
            >
              <X className="w-4 h-4" stroke="#111" strokeWidth={1.5} />
            </button>

            {/* Loading state */}
            {loading && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 border-2 border-[#E8E8E8] border-t-[#111] rounded-full animate-spin" />
                  <span className="text-[12px] text-[#999] tracking-wider uppercase">Loading</span>
                </div>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <p className="text-[14px] text-[#999] mb-4">Failed to load product details.</p>
                  <button suppressHydrationWarning
                    onClick={handleClose}
                    className="px-6 py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}

            {/* Product content */}
            {product && !loading && !error && (
              <div className="flex flex-col md:flex-row">
                {/* Image section - Left */}
                <div className="w-full md:w-1/2 relative">
                  <div className="aspect-[3/4] bg-[#F0EFED] relative overflow-hidden">
                    {imgError || !parsedImages[imageIndex] ? (
                      <div className="absolute inset-0 bg-gradient-to-br from-[#E8E8E8] to-[#D1D1D1] flex items-center justify-center">
                        <ShoppingBag className="w-10 h-10 text-[#999]" strokeWidth={1} />
                      </div>
                    ) : (
                      <img
                        src={parsedImages[imageIndex]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={() => setImgError(true)}
                      />
                    )}

                    {/* Discount badge */}
                    {discountPercent > 0 && (
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1.5 text-[11px] font-medium tracking-wide uppercase bg-[#111] text-[#F8F8F6]">
                          {discountPercent}% Off
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  {parsedImages.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {parsedImages.map((img, idx) => (
                        <button suppressHydrationWarning
                          key={idx}
                          onClick={() => {
                            setImageIndex(idx);
                            setImgError(false);
                          }}
                          className={`relative w-16 h-20 flex-shrink-0 bg-[#F0EFED] overflow-hidden transition-opacity ${
                            idx === imageIndex ? "opacity-100 ring-1 ring-[#111]" : "opacity-50 hover:opacity-75"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.name} view ${idx + 1}`}
                            className="w-full h-full object-cover"
                            onError={() => setImgError(true)}
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details section - Right */}
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-center">
                  {/* Brand */}
                  <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-2">
                    {product.brand}
                  </p>

                  {/* Product name */}
                  <h2 className="text-[20px] md:text-[24px] font-normal leading-tight text-[#111] mb-3">
                    {product.name}
                  </h2>

                  {/* Rating */}
                  <div className="mb-4">
                    <StarRating rating={product.rating} count={product.reviewCount} />
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-3 mb-5">
                    <span className="text-[22px] md:text-[26px] font-medium text-[#111]">
                      {formatPrice(product.price)}
                    </span>
                    {product.mrp > product.price && (
                      <span className="text-[15px] text-[#999] line-through">
                        {formatPrice(product.mrp)}
                      </span>
                    )}
                    {discountPercent > 0 && (
                      <span className="text-[12px] font-medium text-[#4D5B47]">
                        {discountPercent}% off
                      </span>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#E8E8E8] my-4" />

                  {/* Color swatches */}
                  {parsedColors.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[12px] font-medium tracking-wider uppercase text-[#666]">
                          Color
                        </span>
                        <span className="text-[12px] text-[#999]">{selectedColor}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {parsedColors.map((color) => (
                          <button suppressHydrationWarning
                            key={color}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-[4px] border-2 transition-all ${
                              selectedColor === color
                                ? "border-[#111] scale-110"
                                : "border-[#E8E8E8] hover:border-[#999]"
                            }`}
                            style={{ backgroundColor: COLOR_MAP[color] || color }}
                            title={color}
                            aria-label={`Select color: ${color}`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Size buttons */}
                  {parsedSizes.length > 0 && (
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-2.5">
                        <span className="text-[12px] font-medium tracking-wider uppercase text-[#666]">
                          Size
                        </span>
                        <button suppressHydrationWarning
                          onClick={handleViewFullDetails}
                          className="text-[11px] text-[#4D5B47] underline underline-offset-2 hover:text-[#111] transition-colors"
                        >
                          Size Guide
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {parsedSizes.map((size) => (
                          <button suppressHydrationWarning
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`min-w-[44px] h-[44px] px-3 text-[13px] font-medium border-2 transition-all flex items-center justify-center ${
                              selectedSize === size
                                ? "border-[#111] bg-[#111] text-[#F8F8F6]"
                                : "border-[#E8E8E8] text-[#111] hover:border-[#999]"
                            }`}
                            aria-label={`Select size: ${size}`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity selector */}
                  <div className="mb-6">
                    <span className="text-[12px] font-medium tracking-wider uppercase text-[#666] mb-2.5 block">
                      Quantity
                    </span>
                    <div className="inline-flex items-center border border-[#E8E8E8]">
                      <button suppressHydrationWarning
                        onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                        className="w-11 h-11 flex items-center justify-center hover:bg-[#F0EFED] transition-colors"
                        aria-label="Decrease quantity"
                        disabled={quantity <= 1}
                      >
                        <Minus className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                      <span className="w-11 h-11 flex items-center justify-center text-[14px] font-medium text-[#111] border-x border-[#E8E8E8]">
                        {quantity}
                      </span>
                      <button suppressHydrationWarning
                        onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                        className="w-11 h-11 flex items-center justify-center hover:bg-[#F0EFED] transition-colors"
                        aria-label="Increase quantity"
                        disabled={quantity >= 10}
                      >
                        <Plus className="w-4 h-4" strokeWidth={1.5} />
                      </button>
                    </div>
                    {product.stock > 0 && product.stock <= 5 && (
                      <p className="text-[11px] text-[#4D5B47] mt-1.5">Only {product.stock} left in stock</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-col gap-3">
                    <motion.button suppressHydrationWarning
                      whileTap={{ scale: 0.98 }}
                      onClick={handleAddToBag}
                      disabled={product.stock === 0}
                      className="w-full py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors flex items-center justify-center gap-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <ShoppingBag className="w-4 h-4" strokeWidth={1.5} />
                      {product.stock === 0 ? "Out of Stock" : "Add to Bag"}
                    </motion.button>

                    <motion.button suppressHydrationWarning
                      whileTap={{ scale: 0.98 }}
                      onClick={handleViewFullDetails}
                      className="w-full py-3.5 border border-[#E8E8E8] text-[#111] text-[12px] font-medium tracking-widest uppercase hover:bg-[#F0EFED] transition-colors flex items-center justify-center gap-2.5"
                    >
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                      View Full Details
                    </motion.button>
                  </div>

                  {/* Trust info */}
                  <div className="mt-6 pt-5 border-t border-[#E8E8E8]">
                    <div className="flex flex-col gap-2">
                      <p className="text-[11px] text-[#999]">
                        <span className="inline-block w-1 h-1 rounded-full bg-[#4D5B47] mr-2" />
                        Free shipping on orders above ₹{FREE_SHIPPING_THRESHOLD.toLocaleString("en-IN")}
                      </p>
                      <p className="text-[11px] text-[#999]">
                        <span className="inline-block w-1 h-1 rounded-full bg-[#4D5B47] mr-2" />
                        Easy 14-day returns & exchanges
                      </p>
                      <p className="text-[11px] text-[#999]">
                        <span className="inline-block w-1 h-1 rounded-full bg-[#4D5B47] mr-2" />
                        100% authentic products
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}