"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { BRAND_NAME, FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { ProductCard } from "@/components/shared/ProductCard";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/shared/ScrollReveal";
import {
  ArrowRight, ChevronRight, Star, Truck, RotateCcw, Shield,
  Sparkles, Clock, Eye, Quote, Briefcase, Cloud, MoveHorizontal,
  Footprints, ShoppingBag, Gem, Shirt
} from "lucide-react";

const iconMap: Record<string, any> = { Truck, RotateCcw, Shield, Sparkles };

function CountUpNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  return (
    <motion.span
      onViewportEnter={() => {
        if (hasAnimated) return;
        setHasAnimated(true);
        let start = 0;
        const duration = 1500;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
          start += increment;
          if (start >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(start));
          }
        }, 16);
      }}
      viewport={{ once: true }}
    >
      {count.toLocaleString()}{suffix}
    </motion.span>
  );
}

interface SiteContent {
  [key: string]: string;
}

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
  stock?: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string;
  productCount: number;
  sortOrder: number;
}

interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  title: string;
  comment: string;
  product: string;
  isFeatured: boolean;
}

const defaultMarqueeItems = [
  "Free shipping on orders over \u20B92,000",
  "30-day hassle-free returns",
  "100% authentic products",
  "Crafted with premium materials",
  "Sustainable practices",
  "Worldwide delivery",
];

const defaultTrustItems = [
  { icon: "Truck", title: "Free Shipping", desc: "On all orders over \u20B92,000" },
  { icon: "RotateCcw", title: "Easy Returns", desc: "30-day no questions asked" },
  { icon: "Shield", title: "Authenticity", desc: "100% genuine products" },
  { icon: "Sparkles", title: "Premium Quality", desc: "Finest materials only" },
];

function useSiteContent() {
  const [content, setContent] = useState<SiteContent>({});
  useEffect(() => {
    fetch("/api/site-content")
      .then((r) => r.json())
      .then((data) => setContent(data.content || {}))
      .catch(() => {});
  }, []);
  return content;
}

// ─── Hero Section ─────────────────────────────────────────────────────
function HeroSection({ content }: { content: SiteContent }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  // Scroll-driven text scaling — text shrinks as you scroll
  const textScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.35]);
  const textY = useTransform(scrollYProgress, [0, 0.5], ["0%", "30%"]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  // Badge and subtitle fade faster
  const badgeOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const subtitleOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const buttonsOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  const badge = content.heroBadge || `New Season ${new Date().getFullYear()}`;
  const title = content.heroTitle || "Redefine Your Style";
  const subtitle = content.heroSubtitle || "Considered essentials crafted from the world's finest materials. Less noise, more substance.";
  const ctaPrimary = content.heroCtaPrimary || "Shop Collection";
  const ctaSecondary = content.heroCtaSecondary || "Our Story";
  const heroImage = content.heroImage || "/images/hero-bg.png";

  return (
    <section ref={ref} className="relative h-[150vh]">
      {/* Sticky viewport */}
      <div className="sticky top-0 h-screen overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: bgY, opacity: heroOpacity }}>
          <img
            src={heroImage}
            alt={`${BRAND_NAME} Collection`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/30" />
          <motion.div
            className="absolute bottom-0 left-0 right-0 h-40"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)" }}
          />
        </motion.div>

        {/* Scrolling text container — scales down with scroll */}
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6"
          style={{
            scale: textScale,
            y: textY,
            opacity: textOpacity,
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-4 flex items-center gap-3"
            style={{ opacity: badgeOpacity }}
          >
            <span className="hidden sm:block w-8 h-[1px] bg-white/30" />
            <span className="text-[11px] font-medium tracking-[0.3em] uppercase text-white/70">
              {badge}
            </span>
            <span className="hidden sm:block w-8 h-[1px] bg-white/30" />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[40px] sm:text-[56px] md:text-[72px] lg:text-[88px] xl:text-[110px] font-medium tracking-[-0.03em] text-white leading-[0.92] mb-4 sm:mb-6"
          >
            {title.includes(" ") ? (
              <>
                {title.split(" ").slice(0, Math.ceil(title.split(" ").length / 2)).join(" ")}
                <br />
                <span className="italic font-normal text-white/80">{title.split(" ").slice(Math.ceil(title.split(" ").length / 2)).join(" ")}</span>
              </>
            ) : title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[15px] sm:text-[17px] text-white/70 max-w-[90%] sm:max-w-[420px] mb-8 sm:mb-10 leading-relaxed"
            style={{ opacity: subtitleOpacity }}
          >
            {subtitle}
          </motion.p>

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
            style={{ opacity: buttonsOpacity }}
          >
            <motion.button suppressHydrationWarning
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => useStore.getState().navigate("shop")}
              className="px-6 sm:px-8 py-4 bg-white text-[#111] text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-[#F0EFED] transition-colors flex items-center justify-center gap-2 min-w-[170px] sm:min-w-[200px]"
            >
              {ctaPrimary} <ArrowRight className="w-4 h-4" />
            </motion.button>
            <motion.button suppressHydrationWarning
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 sm:px-8 py-4 border border-white/40 text-white text-[12px] font-medium tracking-[0.2em] uppercase hover:bg-white/10 backdrop-blur-sm transition-colors flex items-center justify-center gap-2 min-w-[170px] sm:min-w-[200px]"
            >
              {ctaSecondary}
            </motion.button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          style={{ opacity: subtitleOpacity }}
        >
          <span className="text-[10px] tracking-[0.3em] uppercase text-white/40">Scroll</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-6 bg-gradient-to-b from-white/40 to-transparent"
          />
        </motion.div>
      </div>
    </section>
  );
}

// ─── Marquee Banner ───────────────────────────────────────────────────
function MarqueeBanner({ content }: { content: SiteContent }) {
  let items = defaultMarqueeItems;
  try {
    if (content.marqueeItems) items = JSON.parse(content.marqueeItems);
  } catch {}

  return (
    <div
      className="bg-[#111] py-3 overflow-hidden"
      style={{ maskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)', WebkitMaskImage: 'linear-gradient(to right, transparent, black 5%, black 95%, transparent)' }}
    >
      <div className="animate-marquee flex items-center gap-8 whitespace-nowrap">
        {[...items, ...items].map((item: string, i: number) => (
          <span key={i} className="flex items-center gap-8 text-[11px] tracking-[0.15em] uppercase text-[#999]">
            {item}
            <span className="text-[#4D5B47]">&#x2022;</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Categories Section (Dynamic) ────────────────────────────────────
function CategoriesSection() {
  const { navigate, setFilter, resetFilters } = useStore();
  const ref = useRef<HTMLDivElement>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const res = await fetch("/api/categories?withCounts=true");
        const data = await res.json();
        setCategories((data.categories || []).sort((a: Category, b: Category) => a.sortOrder - b.sortOrder));
      } catch (e) {
        console.error("Failed to fetch categories:", e);
      }
      setLoading(false);
    }
    fetchCategories();
  }, []);

  const handleCategoryClick = (category: string) => {
    resetFilters();
    setFilter("category", [category]);
    navigate("shop");
  };

  const categoryColors = [
    "from-[#F0EFED] to-[#E8E6E0]", "from-[#E8E6E0] to-[#D9DDD6]", "from-[#D9DDD6] to-[#E5DDD2]",
    "from-[#E5DDD2] to-[#DEE0DE]", "from-[#DEE0DE] to-[#E0DDD5]", "from-[#E0DDD5] to-[#D8D5D0]",
    "from-[#D8D5D0] to-[#DDD8CF]", "from-[#DDD8CF] to-[#D5D0C8]", "from-[#D5D0C8] to-[#E2DED6]",
    "from-[#E2DED6] to-[#F0EFED]",
  ];

  const iconMap: Record<string, React.ReactNode> = {
    "Shirt": <Shirt className="w-6 h-6" strokeWidth={1.2} />,
    "Menu": <Shirt className="w-6 h-6" strokeWidth={1.2} />,
    "Briefcase": <Briefcase className="w-6 h-6" strokeWidth={1.2} />,
    "Cloud": <Cloud className="w-6 h-6" strokeWidth={1.2} />,
    "Star": <Star className="w-6 h-6" strokeWidth={1.2} />,
    "MoveHorizontal": <MoveHorizontal className="w-6 h-6" strokeWidth={1.2} />,
    "Shield": <Shield className="w-6 h-6" strokeWidth={1.2} />,
    "Footprints": <Footprints className="w-6 h-6" strokeWidth={1.2} />,
    "ShoppingBag": <ShoppingBag className="w-6 h-6" strokeWidth={1.2} />,
    "Gem": <Gem className="w-6 h-6" strokeWidth={1.2} />,
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
            <button suppressHydrationWarning
              onClick={() => navigate("shop")}
              className="hidden sm:flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#666] hover:text-[#111] transition-colors group"
            >
              View All <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="aspect-[4/5] p-5 sm:p-6 space-y-3 rounded-[4px]">
                <div className="animate-pulse bg-[#E8E8E8] rounded-[4px] h-12 w-12" />
                <div className="animate-pulse bg-[#E8E8E8] rounded-[4px] h-4 w-20" />
                <div className="animate-pulse bg-[#E8E8E8] rounded-[4px] h-3 w-16" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div
            ref={ref}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 sm:gap-4"
          >
            {categories.map((cat, i) => (
              <motion.button suppressHydrationWarning
                key={cat.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative overflow-hidden aspect-[4/5] p-5 sm:p-6 text-left rounded-[4px] transition-all duration-300 hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${categoryColors[i % categoryColors.length]} transition-transform duration-700 group-hover:scale-105`} />
                <div className="absolute bottom-0 left-0 h-[2px] bg-[#4D5B47] w-0 group-hover:w-full transition-all duration-[400ms] ease-[cubic-bezier(0.25,0.1,0.25,1)]" />
                <div className="relative z-10 h-full flex flex-col justify-between">
                  <div className="w-11 h-11 rounded-[4px] bg-white/60 backdrop-blur-sm flex items-center justify-center text-[#4D5B47] transition-all duration-300 group-hover:bg-white group-hover:shadow-sm">
                    {iconMap[cat.icon] || <span className="text-[18px] font-medium">{cat.name.charAt(0)}</span>}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-medium text-[#111] mb-0.5">{cat.name}</h3>
                    <span className="text-[11px] text-[#999]">{cat.productCount} products</span>
                  </div>
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}

// ─── Product Section (Reusable, Dynamic) ──────────────────────────────
function ProductSection({
  title,
  subtitle,
  fetchParam,
  viewAllFilter,
  limit = 4,
}: {
  title: string;
  subtitle: string;
  fetchParam: string;
  viewAllFilter?: string;
  limit?: number;
}) {
  const { navigate, setFilter, resetFilters } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products?${fetchParam}&limit=${limit}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [fetchParam, limit]);

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
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] block mb-2">{subtitle}</span>
              <h2 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">{title}</h2>
            </div>
            <button suppressHydrationWarning
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
              {Array.from({ length: Math.min(limit, 8) }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] animate-pulse bg-[#E8E8E8] rounded-[4px]" />
                  <div className="h-3 w-16 animate-pulse bg-[#E8E8E8] rounded-[4px]" />
                  <div className="h-4 w-full animate-pulse bg-[#E8E8E8] rounded-[4px]" />
                  <div className="h-4 w-20 animate-pulse bg-[#E8E8E8] rounded-[4px]" />
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
          <button suppressHydrationWarning
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
function EditorialSection({ content }: { content: SiteContent }) {
  const imgRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: imgRef, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], [30, -30]);

  const badge = content.editorialBadge || "Our Philosophy";
  const title = content.editorialTitle || "Less noise.\nMore substance.";
  const titleColor = content.editorialTitleColor || "#4D5B47";
  const paragraphs = (content.editorialText || `At ${BRAND_NAME}, we believe the best style is invisible. No logos screaming for attention, no trends chasing the moment. Just exceptional materials, considered design, and pieces that speak for themselves.|Every garment is a result of hundreds of decisions \u2014 from the mill where the fabric is woven to the last stitch. We partner with the same artisans and suppliers as the world's most prestigious houses, making true luxury accessible.`).split("|");
  const editorialImage = content.editorialImage || "/images/products/product-6.png";
  const cta = content.editorialCta || "Discover Our Collection";
  const label = content.editorialLabel || "SS25 Collection";

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <ScrollReveal direction="left">
            <motion.div ref={imgRef} className="relative aspect-[4/5] bg-[#F0EFED] overflow-hidden" style={{ y: imgY }}>
              <img
                src={editorialImage}
                alt={`${BRAND_NAME} Editorial`}
                className="absolute inset-0 w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/50 to-transparent">
                <span className="text-[11px] tracking-[0.2em] uppercase text-white/80">{label}</span>
              </div>
            </motion.div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.15}>
            <div className="lg:pl-8">
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase block mb-4" style={{ color: titleColor }}>{badge}</span>
              <span                className="hidden sm:block text-[64px] leading-none text-[#E8E8E8] font-serif select-none mb-2 -ml-1">&ldquo;</span>
              <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.02em] text-[#111] leading-[1.1] mb-6">
                {title.split("\n").map((line: string, i: number) => (
                  <span key={i}>
                    {i > 0 && <br />}
                    {i === title.split("\n").length - 1 ? <span style={{ color: titleColor }}>{line}</span> : line}
                  </span>
                ))}
              </h2>
               <div className="space-y-4 text-[15px] text-[#666] leading-relaxed mb-8">
                {paragraphs.map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
              <motion.button suppressHydrationWarning
                whileHover={{ x: 4 }}
                onClick={() => useStore.getState().navigate("shop")}
                className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.15em] uppercase text-[#111] hover:text-[#4D5B47] transition-colors group"
              >
                {cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

// ─── Flash Deals Section (Dynamic) ───────────────────────────────────
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
                <div className="aspect-[3/4] animate-pulse bg-[#1A1A1A] rounded-[4px]" />
                <div className="h-3 w-20 animate-pulse bg-[#1A1A1A] rounded-[4px]" />
                <div className="h-4 w-full animate-pulse bg-[#1A1A1A] rounded-[4px]" />
                <div className="h-4 w-24 animate-pulse bg-[#1A1A1A] rounded-[4px]" />
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
          >
            {products.map((p, i) => (
              <motion.div
                key={p.id}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                className="group cursor-pointer"
                onClick={() => navigate("product", p.id)}
              >
                <div className="relative aspect-[3/4] bg-[#1A1A1A] overflow-hidden mb-3 group-hover:[box-shadow:inset_0_0_30px_rgba(0,0,0,0.3)] transition-[box-shadow] duration-500">
                   <img
                     src={p.image}
                     alt={p.name}
                     className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                     loading="lazy"
                   />
                  <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#C53030] text-[#F8F8F6] text-[11px] font-medium tracking-wide uppercase">
                    {Math.round(p.discount)}% Off
                  </span>
                </div>
                <p className="text-[11px] text-[#666] tracking-wider uppercase mb-1">{p.brand}</p>
                 <h3 className="text-[14px] text-[#F8F8F6] mb-2 line-clamp-1">{p.name}</h3>
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
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[14px] text-[#666]">No flash deals available right now</p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Testimonials Section (Dynamic) ──────────────────────────────────
function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const res = await fetch("/api/testimonials");
        const data = await res.json();
        const all = data.testimonials || [];
        // Show featured first, then others, up to 3
        const featured = all.filter((t: Testimonial) => t.isFeatured);
        const rest = all.filter((t: Testimonial) => !t.isFeatured);
        setTestimonials([...featured, ...rest].slice(0, 3));
      } catch (e) {
        console.error("Failed to fetch testimonials:", e);
      }
      setLoading(false);
    }
    fetchTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-16 lg:py-24">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="text-center mb-12">
              <div className="animate-pulse bg-[#E8E8E8] rounded-sm h-3 w-24 mx-auto mb-3" />
              <div className="animate-pulse bg-[#E8E8E8] rounded-sm h-8 w-64 mx-auto" />
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="p-6 sm:p-8 border border-[#E8E8E8] bg-white space-y-4">
                <div className="animate-pulse bg-[#E8E8E8] rounded-sm h-6 w-6" />
                <div className="space-y-2">
                  <div className="animate-pulse bg-[#E8E8E8] rounded-sm h-3 w-full" />
                  <div className="animate-pulse bg-[#E8E8E8] rounded-sm h-3 w-full" />
                  <div className="animate-pulse bg-[#E8E8E8] rounded-sm h-3 w-3/4" />
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, si) => (
                    <div key={si} className="animate-pulse bg-[#E8E8E8] rounded-sm h-3.5 w-3.5" />
                  ))}
                </div>
                <div className="flex items-center gap-3 pt-4 border-t border-[#F0EFED]">
                  <div className="animate-pulse bg-[#E8E8E8] rounded-full h-9 w-9" />
                  <div className="space-y-2">
                    <div className="animate-pulse bg-[#E8E8E8] rounded-sm h-3 w-24" />
                    <div className="animate-pulse bg-[#E8E8E8] rounded-sm h-3 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) return null;

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
          {testimonials.map((t) => (
            <StaggerItem key={t.id}>
              <div className="p-6 sm:p-8 border border-[#E8E8E8] border-l-[3px] border-l-[#4D5B47] bg-white h-full flex flex-col hover:shadow-md transition-shadow duration-300 group">
                <Quote className="w-6 h-6 text-[#E8E8E8] mb-4 flex-shrink-0" strokeWidth={1} />
                {t.title && (
                  <p className="text-[11px] font-medium tracking-[0.15em] uppercase text-[#4D5B47] mb-2">{t.title}</p>
                )}
                <p className="text-[14px] text-[#555] italic leading-[1.8] flex-1 mb-6">
                  &ldquo;{t.comment}&rdquo;
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
                    {t.name.charAt(0)}
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
function TrustSection({ content }: { content: SiteContent }) {
  let items = defaultTrustItems;
  try {
    if (content.trustItems) items = JSON.parse(content.trustItems);
  } catch {}

  return (
    <section className="py-16 lg:py-24 border-t border-[#E8E8E8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-y-8 gap-x-4 lg:gap-8"
        >
          {items.map((item: any, i: number) => {
            const Icon = iconMap[item.icon] || Sparkles;
            return (
              <motion.div
                key={item.title}
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
                className="flex flex-col items-center text-center px-2 sm:px-4"
              >
                 <motion.div
                   whileInView={{ scale: [1, 1.1, 1] }}
                   viewport={{ once: true, margin: "-50px" }}
                   transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.3 }}
                   className="w-11 h-11 bg-[#F0EFED] flex items-center justify-center mb-3 shrink-0"
                 >
                  <Icon className="w-5 h-5 text-[#4D5B47]" strokeWidth={1.5} />
                </motion.div>
                <h4 className="text-[13px] font-medium text-[#111] mb-1 whitespace-nowrap sm:whitespace-normal">{item.title}</h4>
                <p className="text-[11px] sm:text-[12px] text-[#999] leading-snug">{item.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Feature Highlight Section ────────────────────────────────────────
function FeatureHighlight({ content }: { content: SiteContent }) {
  let features = [
    { image: "/images/products/product-4.png", badge: "New Season", title: "Knitwear", subtitle: "Cashmere & merino essentials" },
    { image: "/images/products/product-5.png", badge: "Handcrafted", title: "Footwear", subtitle: "Boots, sneakers & more" },
    { image: "/images/products/product-10.png", badge: "Investment Pieces", title: "Outerwear", subtitle: "Coats & jackets for every season" },
  ];
  try {
    if (content.features) features = JSON.parse(content.features);
  } catch {}

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        >
          {features.map((f: any, i: number) => (
            <motion.div
              key={i}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}
              className="relative aspect-[3/4] bg-[#F0EFED] overflow-hidden group cursor-pointer"
              onClick={() => useStore.getState().navigate("shop")}
            >
              <img src={f.image} alt={f.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <span className="text-[11px] tracking-[0.2em] uppercase text-white/70 block mb-1">{f.badge}</span>
                <h3 className="text-[20px] sm:text-[24px] font-medium text-white tracking-[-0.02em]">{f.title}</h3>
                <p className="text-[13px] text-white/70 mt-1">{f.subtitle}</p>
                <span className="inline-flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-white mt-3 group-hover:gap-2.5 transition-all">
                  Explore <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Stats Banner ─────────────────────────────────────────────────────
function StatsBanner({ content }: { content: SiteContent }) {
  let stats = [
    { value: "15K+", label: "Happy Customers" },
    { value: "44", label: "Premium Products" },
    { value: "26", label: "In-House Brands" },
    { value: "4.7", label: "Average Rating" },
  ];
  try {
    if (content.stats) stats = JSON.parse(content.stats);
  } catch {}

  return (
    <section className="py-16 lg:py-24 bg-[#4D5B47] border-t-2 border-t-[#3A4835]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {stats.map((stat: any, i: number) => {
            const val = String(stat.value);
            const hasK = val.toUpperCase().includes("K");
            const numericStr = val.replace(/[^0-9.]/g, "");
            const target = parseFloat(numericStr) || 0;
            const suffix = hasK ? "K+" : "";
            return (
              <ScrollReveal key={stat.label} delay={i * 0.06}>
                <div className="text-center">
                  <span className="text-[28px] sm:text-[36px] font-medium tracking-tight text-[#F8F8F6] block">
                    <CountUpNumber target={target} suffix={suffix} />
                  </span>
                  <span className="text-[11px] tracking-[0.15em] uppercase text-[#F8F8F6]/60">
                    {stat.label}
                  </span>
                </div>
              </ScrollReveal>
            );
          })}
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
    <section className="py-16 lg:py-24 border-t border-[#E8E8E8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] block mb-2">Your History</span>
              <h2 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">Recently Viewed</h2>
            </div>
            <button suppressHydrationWarning
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

// ─── Trending Now Section (Combined Best Sellers + Trending) ──────────
function TrendingNowSection() {
  const { navigate, setFilter, resetFilters } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  useEffect(() => {
    async function fetchTrending() {
      setLoading(true);
      try {
        const [bestRes, trendRes] = await Promise.all([
          fetch("/api/products?bestSeller=true&limit=4"),
          fetch("/api/products?trending=true&limit=4"),
        ]);
        const bestData = await bestRes.json();
        const trendData = await trendRes.json();
        const bestProducts = bestData.products || [];
        const trendProducts = (trendData.products || []).filter(
          (p: Product) => !bestProducts.some((bp: Product) => bp.id === p.id)
        );
        setProducts([...bestProducts, ...trendProducts].slice(0, 8));
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    }
    fetchTrending();
  }, []);

  const handleViewAll = () => {
    resetFilters();
    setFilter("sortBy", "popularity");
    navigate("shop");
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] block mb-2">Popular</span>
              <h2 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">Trending Now</h2>
            </div>
            <button suppressHydrationWarning
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
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] animate-pulse bg-[#E8E8E8] rounded-[4px]" />
                  <div className="h-3 w-16 animate-pulse bg-[#E8E8E8] rounded-[4px]" />
                  <div className="h-4 w-full animate-pulse bg-[#E8E8E8] rounded-[4px]" />
                  <div className="h-4 w-20 animate-pulse bg-[#E8E8E8] rounded-[4px]" />
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
          <button suppressHydrationWarning
            onClick={handleViewAll}
            className="px-6 py-2.5 border border-[#E8E8E8] text-[12px] tracking-widest uppercase text-[#111] hover:border-[#999] transition-colors"
          >
            View All Trending
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Press Bar ────────────────────────────────────────────────────────
function PressBar() {
  const brands = ["Vogue", "GQ", "Esquire", "Harper's Bazaar", "Wired", "Monocle"];
  return (
    <section className="py-12 border-y border-[#E8E8E8]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] mb-8">
          As Featured In
        </p>
        <div className="flex items-center justify-center gap-8 sm:gap-12 lg:gap-16 flex-wrap opacity-40">
          {brands.map((brand) => (
            <span key={brand} className="text-[16px] sm:text-[18px] font-medium tracking-[0.1em] uppercase text-[#111]">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Newsletter Section ───────────────────────────────────────────────
function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section className="py-16 lg:py-24 bg-[#111]">
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#999] mb-4"
        >
          Stay Connected
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-[28px] sm:text-[36px] font-medium text-[#F8F8F6] tracking-[-0.02em] mb-4"
        >
          Join the {BRAND_NAME} circle
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-[15px] text-[#999] max-w-[400px] mx-auto mb-8"
        >
          Early access to new arrivals, exclusive offers, and style inspiration.
        </motion.p>
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          onSubmit={(e) => {
            e.preventDefault();
            if (email.trim()) {
              fetch("/api/newsletter", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim() }),
              }).then(() => setSubmitted(true)).catch(() => {});
            }
          }}
          className="flex gap-3 max-w-[480px] mx-auto"
        >
          <input suppressHydrationWarning
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="flex-1 px-4 py-3.5 bg-transparent border border-[#333] text-[#F8F8F6] text-[14px] placeholder:text-[#666] outline-none focus:border-[#4D5B47] transition-colors"
          />
          <button suppressHydrationWarning
            type="submit"
            className="px-6 py-3.5 bg-[#4D5B47] text-[#F8F8F6] text-[12px] font-medium tracking-wider uppercase hover:bg-[#5C6B56] transition-colors"
          >
            {submitted ? "Subscribed" : "Subscribe"}
          </button>
        </motion.form>
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
  const content = useSiteContent();

  return (
    <main>
      <HeroSection content={content} />
      <MarqueeBanner content={content} />
      <CategoriesSection />
      <GradientDivider />
      <ProductSection
        title="Featured Collection"
        subtitle="Curated"
        fetchParam="featured=true"
        viewAllFilter="popularity"
        limit={8}
      />
      <ProductSection
        title="New Arrivals"
        subtitle="Just In"
        fetchParam="new=true&sort=newest"
        viewAllFilter="newest"
        limit={8}
      />
      <EditorialSection content={content} />
      <GradientDivider />
      <FeatureHighlight content={content} />
      <TrendingNowSection />
      <GradientDivider />
      <FlashDealsSection />
      <GradientDivider />
      <StatsBanner content={content} />
      <TestimonialsSection />
      <GradientDivider />
      <RecentlyViewedSection />
      <PressBar />
      <NewsletterSection />
      <TrustSection content={content} />
      <div
        className="h-1"
        style={{
          background: "linear-gradient(to right, transparent, #4D5B47 30%, #4D5B47 70%, transparent)",
        }}
      />
    </main>
  );
}