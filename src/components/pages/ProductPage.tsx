"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/shared/ProductCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import {
  ArrowLeft, Heart, ShoppingBag, Star, Truck, RotateCcw, Shield,
  ChevronDown, ChevronRight, Minus, Plus, Check, Ruler
} from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  mrp: number;
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
  reviews: Review[];
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  title: string | null;
  comment: string | null;
  createdAt: string;
}

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

function ImageGallery({ images, productName }: { images: string[]; productName: string }) {
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
        className="relative aspect-[3/4] bg-[#F0EFED] overflow-hidden cursor-crosshair"
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        onMouseMove={handleMouseMove}
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
            <Image
              src={images[activeIndex]}
              alt={`${productName} - Image ${activeIndex + 1}`}
              fill
              className="object-cover transition-transform duration-300"
              style={zoomed ? { transform: "scale(1.8)", transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </motion.div>
        </AnimatePresence>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur-sm px-3 py-1">
            <span className="text-[11px] text-white font-medium">{activeIndex + 1} / {images.length}</span>
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
                i === activeIndex ? "border-[#111]" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image src={img} alt="" width={64} height={80} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function CollapsibleSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E8E8E8]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-4 text-[13px] font-medium tracking-wide text-[#111] hover:text-[#666] transition-colors"
      >
        {title}
        {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
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

export default function ProductPage() {
  const { selectedProductId, navigate, goBack, addToCart, toggleWishlist, isInWishlist, addToRecentlyViewed, setSizeGuideOpen } = useStore();
  const [product, setProduct] = useState<Product | null>(null);
  const [similar, setSimilar] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  const fetchProduct = useCallback(async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${selectedProductId}`);
      const data = await res.json();
      setProduct(data.product);
      setSimilar(data.similar || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [selectedProductId]);

  useEffect(() => { fetchProduct(); }, [fetchProduct]);

  // Track recently viewed
  useEffect(() => {
    if (product) {
      const timer = setTimeout(() => {
        addToRecentlyViewed(product.id);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [product]);

  useEffect(() => {
    if (product) {
      const sizes: string[] = JSON.parse(product.sizes);
      const colors: string[] = JSON.parse(product.colors);
      if (!selectedSize && sizes.length > 0 && sizes[0] !== "ONE SIZE") {
        setSelectedSize(sizes[Math.min(2, sizes.length - 1)]);
      }
      if (!selectedColor && colors.length > 0) {
        setSelectedColor(colors[0]);
      }
    }
  }, [product]);

  if (loading) return <main className="min-h-screen bg-[#F8F8F6] pt-20"><div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8"><ProductSkeleton /></div></main>;
  if (!product) return <main className="min-h-screen bg-[#F8F8F6] pt-20 flex items-center justify-center"><p className="text-[15px] text-[#666]">Product not found</p></main>;

  const images: string[] = JSON.parse(product.images);
  const sizes: string[] = JSON.parse(product.sizes);
  const colors: string[] = JSON.parse(product.colors);
  const inWishlist = isInWishlist(product.id);
  const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
  const deliveryStr = deliveryDate.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });

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
            <button onClick={() => navigate("home")} className="hover:text-[#111] transition-colors">Home</button>
            <ChevronRight className="w-3 h-3" />
            <button onClick={() => navigate("shop")} className="hover:text-[#111] transition-colors">{product.category}</button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-[#111] truncate max-w-[200px]">{product.name}</span>
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
            <ImageGallery images={images} productName={product.name} />
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

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 fill-[#111] text-[#111]" />
                  <span className="text-[14px] font-medium">{product.rating}</span>
                </div>
                <span className="text-[13px] text-[#999]">({product.reviewCount} reviews)</span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-[24px] sm:text-[28px] font-medium text-[#111]">
                  {"\u20B9"}{product.price.toLocaleString("en-IN")}
                </span>
                {product.mrp > product.price && (
                  <>
                    <span className="text-[16px] text-[#999] line-through">
                      {"\u20B9"}{product.mrp.toLocaleString("en-IN")}
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
                  {product.description.length > 200 ? product.description.slice(0, 200) + "..." : product.description}
                </p>
              )}

              <div className="border-t border-[#E8E8E8]" />

              {/* Color Selection */}
              {colors.length > 0 && (
                <div>
                  <p className="text-[12px] font-medium tracking-wider uppercase text-[#111] mb-3">
                    Color: <span className="text-[#999] font-normal normal-case tracking-normal">{selectedColor}</span>
                  </p>
                  <div className="flex items-center gap-2">
                    {colors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`w-8 h-8 border-2 transition-all ${
                          selectedColor === color ? "border-[#111] scale-110" : "border-[#E8E8E8] hover:border-[#999]"
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
                      Size: <span className="text-[#999] font-normal normal-case tracking-normal">{selectedSize || "Select"}</span>
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
                <p className="text-[12px] font-medium tracking-wider uppercase text-[#111] mb-3">Quantity</p>
                <div className="inline-flex items-center border border-[#E8E8E8]">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-[#F0EFED] transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                  <span className="w-12 text-center text-[14px] font-medium">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="w-11 h-11 flex items-center justify-center hover:bg-[#F0EFED] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" strokeWidth={1.5} />
                  </button>
                </div>
                {product.stock <= 5 && product.stock > 0 && (
                  <p className="text-[12px] text-[#C53030] mt-2">Only {product.stock} left in stock</p>
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
                      inWishlist ? "border-[#111] bg-[#111]" : "border-[#E8E8E8] hover:border-[#999]"
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${inWishlist ? "text-[#F8F8F6]" : "text-[#111]"}`}
                      fill={inWishlist ? "currentColor" : "none"}
                      strokeWidth={1.5}
                    />
                  </button>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="border-t border-b border-[#E8E8E8] py-4 space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-4 h-4 text-[#4D5B47] flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[13px] text-[#111]">Free delivery by <span className="font-medium">{deliveryStr}</span></p>
                    <p className="text-[11px] text-[#999]">Order within 2 hours for earliest delivery</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <RotateCcw className="w-4 h-4 text-[#4D5B47] flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[13px] text-[#111]">Easy 30-day returns</p>
                    <p className="text-[11px] text-[#999]">No questions asked return policy</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-[#4D5B47] flex-shrink-0" strokeWidth={1.5} />
                  <div>
                    <p className="text-[13px] text-[#111]">100% authentic products</p>
                    <p className="text-[11px] text-[#999]">Sourced directly from brands</p>
                  </div>
                </div>
              </div>

              {/* Product Details Accordion */}
              <div>
                <CollapsibleSection title="Description &amp; Fit" defaultOpen>
                  <p className="text-[14px] text-[#666] leading-relaxed">{product.description}</p>
                </CollapsibleSection>
                <CollapsibleSection title="Material &amp; Care">
                  {product.material && (
                    <p className="text-[13px] text-[#666] mb-2"><span className="text-[#111] font-medium">Material:</span> {product.material}</p>
                  )}
                  {product.care && (
                    <p className="text-[13px] text-[#666]"><span className="text-[#111] font-medium">Care:</span> {product.care}</p>
                  )}
                </CollapsibleSection>
                <CollapsibleSection title="Shipping &amp; Returns">
                  <div className="space-y-2 text-[13px] text-[#666]">
                    <p>Free shipping on orders over {"\u20B9"}2,000</p>
                    <p>Standard delivery: 3-5 business days</p>
                    <p>Express delivery: 1-2 business days ({"\u20B9"}299)</p>
                    <p>30-day hassle-free returns</p>
                    <p>Free returns on orders over {"\u20B9"}5,000</p>
                  </div>
                </CollapsibleSection>
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Reviews Section */}
        {product.reviews && product.reviews.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <ScrollReveal>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-[24px] sm:text-[28px] font-medium tracking-[-0.02em]">Reviews</h2>
                  <p className="text-[13px] text-[#999] mt-1">{product.reviewCount} reviews</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[32px] font-medium">{product.rating}</span>
                  <div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < Math.round(product.rating) ? "fill-[#111] text-[#111]" : "text-[#D1D1D1]"}`}
                        />
                      ))}
                    </div>
                    <p className="text-[11px] text-[#999] mt-0.5">Average rating</p>
                  </div>
                </div>
              </div>
            </ScrollReveal>

            <div className="space-y-4">
              {product.reviews.map((review, i) => (
                <ScrollReveal key={review.id} delay={i * 0.05}>
                  <div className="p-6 border border-[#E8E8E8] bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#F0EFED] rounded-full flex items-center justify-center text-[12px] font-medium text-[#666]">
                          {review.userName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-medium text-[#111]">{review.userName}</p>
                          <p className="text-[11px] text-[#999]">
                            {new Date(review.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, si) => (
                          <Star key={si} className={`w-3 h-3 ${si < review.rating ? "fill-[#111] text-[#111]" : "text-[#D1D1D1]"}`} />
                        ))}
                      </div>
                    </div>
                    {review.title && <p className="text-[14px] font-medium text-[#111] mb-1">{review.title}</p>}
                    {review.comment && <p className="text-[13px] text-[#666] leading-relaxed">{review.comment}</p>}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </section>
        )}

        {/* Similar Products */}
        {similar.length > 0 && (
          <section className="mt-16 lg:mt-24">
            <ScrollReveal>
              <h2 className="text-[24px] sm:text-[28px] font-medium tracking-[-0.02em] mb-8">You May Also Like</h2>
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
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}