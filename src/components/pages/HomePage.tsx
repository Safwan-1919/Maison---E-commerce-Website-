"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/shared/ProductCard";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/shared/ScrollReveal";
import {
  ArrowRight, ChevronRight, Star, Truck, RotateCcw, Shield,
  Sparkles, Clock, Eye, Quote
} from "lucide-react";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  images?: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  discount: number;
  isNew: boolean;
  isTrending: boolean;
  isBestSeller: boolean;
}

const categories = [
  { name: "T-Shirts", desc: "Essential foundations", icon: "T", count: 2 },
  { name: "Shirts", desc: "Button-down perfection", icon: "S", count: 2 },
  { name: "Blazers", desc: "Understated tailoring", icon: "B", count: 1 },
  { name: "Sweaters", desc: "Luxury knitwear", icon: "K", count: 2 },
  { name: "Jeans", desc: "Premium selvedge", icon: "J", count: 1 },
  { name: "Trousers", desc: "Impeccable cuts", icon: "P", count: 2 },
  { name: "Outerwear", desc: "Seasonless elegance", icon: "O", count: 1 },
  { name: "Footwear", desc: "Handcrafted shoes", icon: "F", count: 2 },
  { name: "Bags", desc: "Considered leather", icon: "L", count: 1 },
  { name: "Accessories", desc: "The finishing touch", icon: "A", count: 3 },
];

const testimonials = [
  {
    name: "Arjun Mehta",
    location: "Mumbai",
    text: "The quality is unlike anything else at this price point. The selvedge denim has developed the most beautiful fades over six months.",
    rating: 5,
    avatar: "A",
  },
  {
    name: "Priya Sharma",
    location: "Delhi",
    text: "MAISON has completely replaced my wardrobe. Every piece feels considered and intentional. The cashmere sweater is my absolute favorite.",
    rating: 5,
    avatar: "P",
  },
  {
    name: "Vikram Kannan",
    location: "Bangalore",
    text: "Finally, a brand that understands minimalism without being boring. The tailoring is exceptional and the customer service is top-notch.",
    rating: 5,
    avatar: "V",
  },
];

const marqueeItems = [
  "Free shipping on orders over \u20B92,000",
  "30-day hassle-free returns",
  "100% authentic products",
  "Crafted with premium materials",
  "Sustainable practices",
  "Worldwide delivery",
];

const trustItems = [
  { icon: Truck, title: "Free Shipping", desc: "On all orders over \u20B92,000" },
  { icon: RotateCcw, title: "Easy Returns", desc: "30-day no questions asked" },
  { icon: Shield, title: "Authenticity", desc: "100% genuine products" },
  { icon: Sparkles, title: "Premium Quality", desc: "Finest materials only" },
];

// ─── Hero Section ─────────────────────────────────────────────────────
function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "40%"]);

  return (
    <motion.section ref={ref} className="relative h-screen min-h-[600px] max-h-[900px] overflow-hidden" style={{ opacity }}>
      {/* Background Image */}
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <Image
          src="/images/hero-bg.png"
          alt="MAISON Collection"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
        {/* Animated pulsing gradient at bottom */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-40"
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
        />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6"
        style={{ y: textY }}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-4"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md border border-white/20 text-[11px] font-medium tracking-[0.2em] uppercase text-white/90">
            <Sparkles className="w-3 h-3" />
            New Season 2025
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[40px] sm:text-[56px] md:text-[72px] lg:text-[88px] font-medium tracking-[-0.03em] text-white leading-[0.95] mb-4 sm:mb-6"
        >
          Redefine
          <br />
          <span className="italic font-normal text-white/80">Your Style</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-[14px] sm:text-[16px] text-white/70 max-w-[420px] mb-8 sm:mb-10 leading-relaxed"
        >
          Considered essentials crafted from the world&apos;s finest materials.
          Less noise, more substance.
        </motion.p>

        {/* Decorative line between text and CTA */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={{ opacity: 1, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
          className="w-16 h-px bg-[#E8E8E8]/30 mb-8 sm:mb-10"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col sm:flex-row gap-3 sm:gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => useStore.getState().navigate("shop")}
            className="px-8 py-4 bg-white text-[#111] text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-[#F0EFED] transition-colors flex items-center justify-center gap-2 min-w-[200px]"
          >
            Shop Collection <ArrowRight className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-8 py-4 border border-white/40 text-white text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-white/10 backdrop-blur-sm transition-colors flex items-center justify-center gap-2 min-w-[200px]"
          >
            Our Story
          </motion.button>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-6 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

// ─── Marquee Banner ───────────────────────────────────────────────────
function MarqueeBanner() {
  return (
    <div
      className="bg-[#111] py-3 overflow-hidden"
      style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
    >
      <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
        {[...marqueeItems, ...marqueeItems].map((item, i) => (
          <span key={i} className="flex items-center gap-8 text-[11px] tracking-[0.15em] uppercase text-[#999]">
            {item}
            <span className="text-[#4D5B47]">&#x2022;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Categories Section ───────────────────────────────────────────────
function CategoriesSection() {
  const { navigate, setFilter, resetFilters } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const handleCategoryClick = (category: string) => {
    resetFilters();
    setFilter("category", [category]);
    navigate("shop");
  };

  const categoryColors: Record<string, string> = {
    "T-Shirts": "bg-[#F0EFED]",
    "Shirts": "bg-[#E8E6E0]",
    "Blazers": "bg-[#D9DDD6]",
    "Sweaters": "bg-[#E5DDD2]",
    "Jeans": "bg-[#DEE0DE]",
    "Trousers": "bg-[#E0DDD5]",
    "Outerwear": "bg-[#D8D5D0]",
    "Footwear": "bg-[#DDD8CF]",
    "Bags": "bg-[#D5D0C8]",
    "Accessories": "bg-[#E2DED6]",
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] block mb-2">Browse</span>
              <h2 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">Shop by Category</h2>
            </div>
            <button
              onClick={() => navigate("shop")}
              className="hidden sm:flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#666] hover:text-[#111] transition-colors group"
            >
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </ScrollReveal>

        <div ref={ref} className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
          {categories.map((cat, i) => (
            <motion.button
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.04, ease: [0.25, 0.1, 0.25, 1] }}
              onClick={() => handleCategoryClick(cat.name)}
              className="group relative overflow-hidden p-5 sm:p-6 text-left hover:shadow-md transition-[transform,shadow] duration-300 hover:scale-[1.02]"
            >
              <div className={`absolute inset-0 ${categoryColors[cat.name] || "bg-[#F0EFED]"} transition-transform duration-700`} />
              {/* Bottom border animation line */}
              <div className="absolute bottom-0 left-0 h-[2px] bg-[#4D5B47] w-0 group-hover:w-full transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]" />
              <div className="relative z-10">
                <span className="text-[28px] font-medium tracking-[-0.04em] text-[#D1D1D1] block mb-3 transition-colors duration-300 group-hover:text-[#4D5B47]">
                  {cat.icon}
                </span>
                <h3 className="text-[14px] font-medium text-[#111] mb-0.5">{cat.name}</h3>
                <p className="text-[11px] text-[#999]">{cat.desc}</p>
                <span className={`inline-block mt-2 text-[11px] text-[#999] px-2 py-0.5 bg-[#111]/5 ${isInView ? 'badge-pop' : ''}`}>{cat.count} products</span>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Product Section (Reusable) ───────────────────────────────────────
function ProductSection({
  title,
  subtitle,
  fetchParam,
  viewAllFilter,
}: {
  title: string;
  subtitle: string;
  fetchParam: string;
  viewAllFilter?: string;
}) {
  const { navigate, setFilter, resetFilters } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?${fetchParam}&limit=4`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [fetchParam]);

  useEffect(() => {
    const id = setTimeout(fetchProducts, 0);
    return () => clearTimeout(id);
  }, [fetchProducts]);

  const handleViewAll = () => {
    resetFilters();
    if (viewAllFilter) {
      setFilter("sortBy", viewAllFilter);
    }
    navigate("shop");
  };

  return (
    <section className="py-12 lg:py-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] block mb-2">{subtitle}</span>
              <h2 className="text-[24px] sm:text-[28px] font-medium tracking-[-0.02em]">{title}</h2>
            </div>
            <button
              onClick={handleViewAll}
              className="hidden sm:flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#666] hover:text-[#111] transition-colors group"
            >
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </ScrollReveal>

        <div ref={ref}>
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] skeleton-shimmer rounded-[4px]" />
                  <div className="h-3 w-16 skeleton-shimmer rounded-[4px]" />
                  <div className="h-4 w-full skeleton-shimmer rounded-[4px]" />
                  <div className="h-4 w-20 skeleton-shimmer rounded-[4px]" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              {products.map((p, i) => (
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
                  index={isInView ? i : undefined}
                />
              ))}
            </div>
          )}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <button
            onClick={handleViewAll}
            className="px-6 py-2.5 border border-[#E8E8E8] text-[12px] tracking-widest uppercase text-[#111] hover:border-[#999] transition-colors"
          >
            View All {title}
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Editorial Section ────────────────────────────────────────────────
function EditorialSection() {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <ScrollReveal direction="left">
            <motion.div ref={imgRef} className="relative aspect-[4/5] bg-[#F0EFED] overflow-hidden" style={{ y: imgY }}>
              <Image
                src="/images/products/product-6.png"
                alt="MAISON Editorial"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
                <span className="text-[11px] tracking-[0.2em] uppercase text-white/80">SS25 Collection</span>
              </div>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.15}>
            <div className="lg:pl-8">
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#4D5B47] block mb-4">Our Philosophy</span>
              {/* Decorative quote mark */}
              <span className="block text-[64px] leading-none text-[#E8E8E8] font-serif select-none mb-2 -ml-1">&ldquo;</span>
              <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.02em] text-[#111] leading-[1.1] mb-6">
                Less noise.
                <br />
                <span className="text-[#4D5B47]">More substance.</span>
              </h2>
              <div className="space-y-4 text-[14px] text-[#666] leading-relaxed mb-8">
                <p>
                  At MAISON, we believe the best style is invisible. No logos screaming for attention,
                  no trends chasing the moment. Just exceptional materials, considered design, and
                  pieces that speak for themselves.
                </p>
                <p>
                  Every garment is a result of hundreds of decisions — from the mill where the fabric
                  is woven to the last stitch. We partner with the same artisans and suppliers as
                  the world&apos;s most prestigious houses, making true luxury accessible.
                </p>
              </div>
              <motion.button
                whileHover={{ x: 4 }}
                onClick={() => useStore.getState().navigate("shop")}
                className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.15em] uppercase text-[#111] hover:text-[#4D5B47] transition-colors group"
              >
                Discover Our Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ─── Flash Deals Section ──────────────────────────────────────────────
function FlashDealsSection() {
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 42, seconds: 18 });
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { navigate } = useStore();

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) { hours = 23; minutes = 59; seconds = 59; }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/products?flashDeal=true&limit=4")
      .then((r) => r.json())
      .then((data) => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <section className="py-16 lg:py-24 bg-[#111] text-[#F8F8F6]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Clock className="w-4 h-4 text-[#B79B7B]" strokeWidth={1.5} />
                <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#B79B7B]">Limited Time</span>
              </div>
              <h2 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">Flash Deals</h2>
            </div>
            {/* Countdown */}
            <div className="flex items-center gap-2">
              {[
                { value: timeLeft.hours, label: "HRS" },
                { value: timeLeft.minutes, label: "MIN" },
                { value: timeLeft.seconds, label: "SEC" },
              ].map((unit, i) => (
                <div key={unit.label} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[18px] text-[#4D5B47] font-light">:</span>}
                  <div className="text-center">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[#1A1A1A] border border-[#2A2A2A] flex items-center justify-center text-[20px] sm:text-[24px] font-medium tabular-nums">
                      {pad(unit.value)}
                    </div>
                    <span className="text-[9px] tracking-[0.15em] text-[#666] mt-1 block">{unit.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-[#1A1A1A] rounded-[4px]" />
                <div className="h-3 w-20 bg-[#1A1A1A] rounded-[4px]" />
                <div className="h-4 w-full bg-[#1A1A1A] rounded-[4px]" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group cursor-pointer"
                onClick={() => navigate("product", p.id)}
              >
                <div className="relative aspect-[3/4] bg-[#1A1A1A] overflow-hidden mb-3 group-hover:[box-shadow:inset_0_0_30px_rgba(0,0,0,0.3)] transition-[box-shadow] duration-500">
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#C53030] text-[#F8F8F6] text-[11px] font-medium tracking-wide uppercase">
                    {Math.round(p.discount)}% Off
                  </span>
                </div>
                <p className="text-[11px] text-[#666] tracking-wider uppercase mb-1">{p.brand}</p>
                <h3 className="text-[13px] text-[#F8F8F6] mb-2 line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-medium text-[#F8F8F6]">
                    {"\u20B9"}{p.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-[12px] text-[#666] line-through">
                    {"\u20B9"}{p.mrp.toLocaleString("en-IN")}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[14px] text-[#666]">No flash deals available right now</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Testimonials Section ─────────────────────────────────────────────
function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] block mb-2">Testimonials</span>
            <h2 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">What Our Clients Say</h2>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <StaggerItem key={t.name}>
              <div className="p-6 sm:p-8 border border-[#E8E8E8] border-l-[3px] border-l-[#4D5B47] bg-white h-full flex flex-col hover:shadow-md transition-shadow duration-300 group">
                <Quote className="w-6 h-6 text-[#E8E8E8] mb-4 flex-shrink-0" strokeWidth={1} />
                <p className="text-[14px] text-[#555] italic leading-[1.8] flex-1 mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <Star
                      key={si}
                      className={`w-3.5 h-3.5 ${si < t.rating ? "fill-[#111] text-[#111]" : "text-[#D1D1D1]"}`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[#F0EFED]">
                  <div className="w-9 h-9 bg-[#F0EFED] rounded-full flex items-center justify-center text-[13px] font-medium text-[#666]">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-[13px] font-medium text-[#111]">{t.name}</p>
                    <p className="text-[11px] text-[#999]">{t.location}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </div>
    </section>
  );
}

// ─── Trust Section ────────────────────────────────────────────────────
function TrustSection() {
  return (
    <section className="py-12 lg:py-16 border-t border-[#E8E8E8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {trustItems.map((item, i) => (
            <ScrollReveal key={item.title} delay={i * 0.08}>
              <div className="flex flex-col items-center text-center p-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                  className="w-11 h-11 bg-[#F0EFED] flex items-center justify-center mb-3"
                >
                  <item.icon className="w-5 h-5 text-[#4D5B47]" strokeWidth={1.5} />
                </motion.div>
                <h4 className="text-[13px] font-medium text-[#111] mb-1">{item.title}</h4>
                <p className="text-[12px] text-[#999]">{item.desc}</p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Feature Highlight Section ────────────────────────────────────────
function FeatureHighlight() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-6">
          <ScrollReveal delay={0}>
            <div className="relative aspect-[3/4] bg-[#F0EFED] overflow-hidden group cursor-pointer" onClick={() => useStore.getState().navigate("shop")}>
              <Image src="/images/products/product-4.png" alt="Knitwear" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-[11px] tracking-[0.2em] uppercase text-white/70 block mb-1">New Season</span>
                <h3 className="text-[20px] sm:text-[24px] font-medium text-white tracking-[-0.02em]">Knitwear</h3>
                <p className="text-[13px] text-white/70 mt-1">Cashmere & merino essentials</p>
                <span className="inline-flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-white mt-3 group-hover:gap-2.5 transition-all">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.1}>
            <div className="relative aspect-[3/4] bg-[#F0EFED] overflow-hidden group cursor-pointer" onClick={() => useStore.getState().navigate("shop")}>
              <Image src="/images/products/product-5.png" alt="Footwear" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-[11px] tracking-[0.2em] uppercase text-white/70 block mb-1">Handcrafted</span>
                <h3 className="text-[20px] sm:text-[24px] font-medium text-white tracking-[-0.02em]">Footwear</h3>
                <p className="text-[13px] text-white/70 mt-1">Boots, sneakers & more</p>
                <span className="inline-flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-white mt-3 group-hover:gap-2.5 transition-all">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="relative aspect-[3/4] bg-[#F0EFED] overflow-hidden group cursor-pointer" onClick={() => useStore.getState().navigate("shop")}>
              <Image src="/images/products/product-10.png" alt="Outerwear" fill className="object-cover transition-transform duration-700 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-[11px] tracking-[0.2em] uppercase text-white/70 block mb-1">Investment Pieces</span>
                <h3 className="text-[20px] sm:text-[24px] font-medium text-white tracking-[-0.02em]">Outerwear</h3>
                <p className="text-[13px] text-white/70 mt-1">Coats & jackets for every season</p>
                <span className="inline-flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-white mt-3 group-hover:gap-2.5 transition-all">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ─── Stats Banner ─────────────────────────────────────────────────────
function StatsBanner() {
  const stats = [
    { value: "15K+", label: "Happy Customers" },
    { value: "16", label: "Premium Products" },
    { value: "9", label: "In-House Brands" },
    { value: "4.7", label: "Average Rating" },
  ];

  return (
    <section className="py-12 lg:py-16 bg-[#4D5B47] border-t-2 border-t-[#3A4835]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat, i) => (
            <ScrollReveal key={stat.label} delay={i * 0.06}>
              <div className="text-center">
                <span className="text-[28px] sm:text-[36px] font-medium tracking-tight text-[#F8F8F6] block">
                  {stat.value}
                </span>
                <span className="text-[11px] tracking-[0.15em] uppercase text-[#F8F8F6]/60">
                  {stat.label}
                </span>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Recently Viewed Section ─────────────────────────────────────────
function RecentlyViewedSection() {
  const { recentlyViewed, navigate } = useStore();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (recentlyViewed.length === 0) {
      const t = setTimeout(() => setProducts([]), 0);
      return () => clearTimeout(t);
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?limit=50`, { signal: controller.signal });
        const data = await res.json();
        const all = data.products || [];
        const filtered = all.filter((p: Product) => recentlyViewed.includes(p.id));
        setProducts(filtered.slice(0, 4));
      } catch { /* ignore */ }
    }, 0);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [recentlyViewed]);

  if (products.length === 0) return null;

  return (
    <section className="py-12 lg:py-16 border-t border-[#E8E8E8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] block mb-2">Your History</span>
              <h2 className="text-[24px] sm:text-[28px] font-medium tracking-[-0.02em]">Recently Viewed</h2>
            </div>
            <button
              onClick={() => navigate("shop")}
              className="hidden sm:flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#666] hover:text-[#111] transition-colors group"
            >
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
          {products.map((p, i) => (
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
      </div>
    </section>
  );
}

// ─── Gradient Divider ──────────────────────────────────────────────────
function GradientDivider() {
  return (
    <div className="flex items-center justify-center py-2">
      <div
        className="w-full max-w-[600px] h-px"
        style={{
          background: "linear-gradient(to right, transparent, #E8E8E8 20%, #E8E8E8 80%, transparent)",
        }}
      />
    </div>
  );
}

// ─── Main HomePage ────────────────────────────────────────────────────
export default function HomePage() {
  const { navigate } = useStore();

  return (
    <main>
      <HeroSection />
      <MarqueeBanner />
      <CategoriesSection />
      <GradientDivider />
      <ProductSection
        title="New Arrivals"
        subtitle="Just In"
        fetchParam="new=true&sort=newest"
        viewAllFilter="newest"
      />
      <EditorialSection />
      <GradientDivider />
      <FeatureHighlight />
      <ProductSection
        title="Trending Now"
        subtitle="Popular"
        fetchParam="trending=true&sort=popularity"
        viewAllFilter="popularity"
      />
      <GradientDivider />
      <FlashDealsSection />
      <ProductSection
        title="Best Sellers"
        subtitle="Most Loved"
        fetchParam="bestSeller=true&sort=popularity"
        viewAllFilter="popularity"
      />
      <GradientDivider />
      <StatsBanner />
      <TestimonialsSection />
      <GradientDivider />
      <RecentlyViewedSection />
      <TrustSection />
      {/* Footer gradient accent line */}
      <div
        className="h-1"
        style={{
          background: "linear-gradient(to right, transparent, #4D5B47 30%, #4D5B47 70%, transparent)",
        }}
      />
    </main>
  );
}