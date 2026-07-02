"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/shared/ProductCard";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/shared/ScrollReveal";
import { ArrowRight, Star, ChevronDown, Truck, RotateCcw, Shield, Sparkles } from "lucide-react";
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
  isFlashDeal: boolean;
}

const categories = [
  { name: "T-Shirts", slug: "t-shirts", desc: "Essential foundations" },
  { name: "Shirts", slug: "shirts", desc: "From casual to formal" },
  { name: "Blazers", slug: "blazers", desc: "Structured elegance" },
  { name: "Sweaters", slug: "sweaters", desc: "Luxurious knits" },
  { name: "Jeans", slug: "jeans", desc: "Selvedge denim" },
  { name: "Trousers", slug: "trousers", desc: "Tailored precision" },
  { name: "Outerwear", slug: "outerwear", desc: "Seasonless layers" },
  { name: "Footwear", slug: "footwear", desc: "Crafted soles" },
  { name: "Bags", slug: "bags", desc: "Leather goods" },
  { name: "Accessories", slug: "accessories", desc: "Finishing touches" },
];

const testimonials = [
  { name: "Arjun M.", location: "Mumbai", rating: 5, text: "The quality is unlike anything I've found online. The cashmere sweater has become my most-worn piece. Every detail speaks of real craftsmanship." },
  { name: "Priya S.", location: "Delhi", rating: 5, text: "MAISON understands that true luxury is in the restraint. Clean designs, exceptional fabrics, and a shopping experience that feels considered." },
  { name: "Vikram K.", location: "Bangalore", rating: 5, text: "I replaced my entire wardrobe with MAISON pieces. The wool blazer alone is worth more than what I used to pay for full suits. Investment dressing done right." },
];

const catImages = [
  "/images/products/product-2.png", "/images/products/product-11.png",
  "/images/products/product-6.png", "/images/products/product-4.png",
  "/images/products/product-3.png", "/images/products/product-9.png",
  "/images/products/product-10.png", "/images/products/product-8.png",
  "/images/products/product-1.png", "/images/products/product-12.png",
];

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      <div className="aspect-[3/4] skeleton-shimmer rounded-[4px]" />
      <div className="h-3 w-16 skeleton-shimmer rounded-[4px]" />
      <div className="h-4 w-full skeleton-shimmer rounded-[4px]" />
      <div className="h-4 w-20 skeleton-shimmer rounded-[4px]" />
    </div>
  );
}

function HeroSection() {
  const { navigate } = useStore();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setLoaded(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <section className="relative min-h-[100vh] flex items-center overflow-hidden bg-[#111]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero-bg.png"
          alt="MAISON Campaign"
          fill
          className="object-cover opacity-50"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#111]/90 via-[#111]/60 to-[#111]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-[#111]/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="mb-4"
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 border border-[#F8F8F6]/20 text-[#F8F8F6] text-[11px] font-medium tracking-[0.2em] uppercase">
              <Sparkles className="w-3 h-3" />
              Autumn/Winter 2025
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[40px] sm:text-[56px] lg:text-[72px] font-medium text-[#F8F8F6] leading-[0.95] tracking-[-0.03em] mb-6"
          >
            Quiet Luxury,
            <br />
            <span className="text-[#F8F8F6]/60">Loud Quality</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-[15px] sm:text-[17px] text-[#F8F8F6]/60 leading-relaxed mb-10 max-w-lg font-light"
          >
            Curated essentials and investment pieces crafted from the world's finest materials.
            Designed for those who understand that true style whispers.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={loaded ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.65, ease: [0.25, 0.1, 0.25, 1] }}
            className="flex flex-wrap gap-4"
          >
            <button
              onClick={() => navigate("shop")}
              className="px-8 py-3.5 bg-[#F8F8F6] text-[#111] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-white transition-colors"
            >
              Shop Collection
            </button>
            <button
              onClick={() => navigate("shop")}
              className="px-8 py-3.5 border border-[#F8F8F6]/30 text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:border-[#F8F8F6]/60 transition-colors"
            >
              New Arrivals
            </button>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={loaded ? { opacity: 1 } : {}}
        transition={{ delay: 1.5, duration: 0.8 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[10px] text-[#F8F8F6]/30 tracking-[0.2em] uppercase">Scroll</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
        >
          <ChevronDown className="w-4 h-4 text-[#F8F8F6]/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

function MarqueeBanner() {
  const text = "FREE SHIPPING ON ORDERS OVER \u20B92,000 \u2022 HANDCRAFTED QUALITY \u2022 SUSTAINABLE MATERIALS \u2022 EASY 30-DAY RETURNS \u2022 ";
  return (
    <div className="bg-[#111] border-t border-b border-[#2A2A2A] py-3 overflow-hidden">
      <div className="animate-marquee whitespace-nowrap flex">
        <span className="text-[11px] tracking-[0.2em] uppercase text-[#F8F8F6]/50 font-medium">
          {text}{text}{text}{text}
        </span>
      </div>
    </div>
  );
}

function CategoriesSection() {
  const { navigate, setFilter, resetFilters } = useStore();

  const handleCategoryClick = (cat: string) => {
    resetFilters();
    setFilter("category", [cat]);
    navigate("shop");
  };

  return (
    <section className="py-16 lg:py-24">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.02em] text-[#111]">
                Shop by Category
              </h2>
              <p className="text-[14px] text-[#666] mt-2">Find exactly what you're looking for</p>
            </div>
            <button
              onClick={() => navigate("shop")}
              className="hidden sm:flex items-center gap-2 text-[12px] tracking-widest uppercase text-[#666] hover:text-[#111] transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 lg:gap-4">
          {categories.map((cat, i) => (
            <ScrollReveal key={cat.slug} delay={i * 0.04} duration={0.4}>
              <button
                onClick={() => handleCategoryClick(cat.name)}
                className="group relative aspect-[3/4] bg-[#F0EFED] overflow-hidden w-full"
              >
                <Image
                  src={catImages[i]}
                  alt={cat.name}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-80 group-hover:scale-105 transition-all duration-700"
                  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 20vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111]/70 via-[#111]/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <h3 className="text-[#F8F8F6] text-[14px] sm:text-[15px] font-medium tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="text-[#F8F8F6]/50 text-[11px] mt-0.5 tracking-wide">{cat.desc}</p>
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProductSection({
  title,
  subtitle,
  fetchUrl,
  viewAllFilter,
}: {
  title: string;
  subtitle?: string;
  fetchUrl: string;
  viewAllFilter?: string;
}) {
  const { navigate, setFilter, resetFilters } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch(fetchUrl)
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) {
          setProducts(data.products || []);
          setLoading(false);
        }
      })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [fetchUrl]);

  const handleViewAll = () => {
    resetFilters();
    if (viewAllFilter) setFilter("sortBy", viewAllFilter);
    navigate("shop");
  };

  return (
    <section className="py-16 lg:py-20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.02em] text-[#111]">
                {title}
              </h2>
              {subtitle && <p className="text-[14px] text-[#666] mt-2">{subtitle}</p>}
            </div>
            <button
              onClick={handleViewAll}
              className="hidden sm:flex items-center gap-2 text-[12px] tracking-widest uppercase text-[#666] hover:text-[#111] transition-colors"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
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
        )}

        <div className="mt-8 text-center sm:hidden">
          <button
            onClick={handleViewAll}
            className="px-6 py-2.5 border border-[#E8E8E8] text-[12px] tracking-widest uppercase text-[#111] hover:bg-[#F0EFED] transition-colors"
          >
            View All
          </button>
        </div>
      </div>
    </section>
  );
}

function EditorialSection() {
  const { navigate } = useStore();

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <ScrollReveal direction="left">
            <div className="relative aspect-[4/5] bg-[#F0EFED] overflow-hidden">
              <Image
                src="/images/products/product-6.png"
                alt="MAISON Editorial"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal direction="right">
            <div className="lg:pl-8">
              <span className="text-[11px] font-medium tracking-[0.2em] uppercase text-[#4D5B47] mb-4 block">
                Our Philosophy
              </span>
              <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.02em] text-[#111] leading-[1.1] mb-6">
                Less, but better.
                <br />
                <span className="text-[#666]">Every piece, a statement.</span>
              </h2>
              <p className="text-[15px] text-[#666] leading-relaxed mb-4">
                At MAISON, we believe in the power of restraint. Each piece in our collection is the result of
                countless hours of sourcing the finest materials, refining patterns, and perfecting fits.
              </p>
              <p className="text-[15px] text-[#666] leading-relaxed mb-8">
                We don't chase trends. We build wardrobes. Clothes that work today, tomorrow, and ten years from now.
                Because true style isn't about what's new — it's about what's right.
              </p>
              <button
                onClick={() => navigate("shop")}
                className="inline-flex items-center gap-2 text-[12px] tracking-widest uppercase text-[#111] font-medium hover:text-[#4D5B47] transition-colors group"
              >
                Discover More
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

function FlashDealsSection() {
  const { navigate } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 47, seconds: 32 });

  useEffect(() => {
    fetch("/api/products?flashDeal=true&limit=4")
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) return { hours: 5, minutes: 59, seconds: 59 };
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <section className="py-16 lg:py-20 bg-[#111]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.02em] text-[#F8F8F6]">
                Flash Deals
              </h2>
              <p className="text-[14px] text-[#F8F8F6]/40 mt-2">Limited time offers on selected pieces</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] tracking-[0.15em] uppercase text-[#F8F8F6]/40">Ends in</span>
              <div className="flex items-center gap-1.5">
                {[
                  { val: timeLeft.hours, label: "HRS" },
                  { val: timeLeft.minutes, label: "MIN" },
                  { val: timeLeft.seconds, label: "SEC" },
                ].map((t, i) => (
                  <div key={t.label} className="flex items-center gap-1.5">
                    <div className="bg-[#1A1A1A] border border-[#2A2A2A] px-3 py-2 text-center min-w-[48px]">
                      <span className="text-[18px] font-medium text-[#F8F8F6] font-mono">{pad(t.val)}</span>
                    </div>
                    {i < 2 && <span className="text-[#F8F8F6]/20 text-[14px]">:</span>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-3">
                <div className="aspect-[3/4] bg-[#1A1A1A] rounded-[4px]" />
                <div className="h-3 w-16 bg-[#1A1A1A] rounded-[4px]" />
                <div className="h-4 w-full bg-[#1A1A1A] rounded-[4px]" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
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
        )}
      </div>
    </section>
  );
}

function TestimonialsSection() {
  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-[28px] sm:text-[36px] lg:text-[42px] font-medium tracking-[-0.02em] text-[#111]">
              What Our Customers Say
            </h2>
            <p className="text-[14px] text-[#666] mt-2">Real experiences from the MAISON community</p>
          </div>
        </ScrollReveal>

        <StaggerContainer className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {testimonials.map((t, i) => (
            <StaggerItem key={i}>
              <div className="p-6 lg:p-8 border border-[#E8E8E8] h-full flex flex-col">
                <div className="flex items-center gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, si) => (
                    <Star key={si} className="w-3.5 h-3.5 fill-[#111] text-[#111]" />
                  ))}
                </div>
                <p className="text-[14px] sm:text-[15px] text-[#333] leading-relaxed flex-1 mb-6">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-[#E8E8E8]">
                  <div>
                    <p className="text-[13px] font-medium text-[#111]">{t.name}</p>
                    <p className="text-[12px] text-[#999]">{t.location}</p>
                  </div>
                  <div className="w-8 h-8 bg-[#F0EFED] rounded-full flex items-center justify-center text-[12px] font-medium text-[#666]">
                    {t.name.charAt(0)}
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

function TrustSection() {
  const features = [
    { icon: Truck, title: "Free Shipping", desc: "On orders over \u20B92,000" },
    { icon: RotateCcw, title: "Easy Returns", desc: "30-day return policy" },
    { icon: Shield, title: "Secure Payment", desc: "256-bit encryption" },
  ];

  return (
    <section className="py-12 border-y border-[#E8E8E8]">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4 lg:gap-8">
          {features.map((f) => (
            <div key={f.title} className="flex flex-col items-center text-center gap-2">
              <f.icon className="w-5 h-5 text-[#4D5B47]" strokeWidth={1.5} />
              <h3 className="text-[12px] sm:text-[13px] font-medium tracking-wide text-[#111]">{f.title}</h3>
              <p className="text-[11px] text-[#999]">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#F8F8F6]">
      <HeroSection />
      <MarqueeBanner />
      <CategoriesSection />
      <ProductSection
        title="New Arrivals"
        subtitle="The latest additions to our collection"
        fetchUrl="/api/products?new=true&limit=8"
        viewAllFilter="newest"
      />
      <EditorialSection />
      <ProductSection
        title="Trending Now"
        subtitle="What the MAISON community is loving"
        fetchUrl="/api/products?trending=true&limit=4"
        viewAllFilter="popularity"
      />
      <FlashDealsSection />
      <ProductSection
        title="Best Sellers"
        subtitle="Tried, tested, and loved"
        fetchUrl="/api/products?bestSeller=true&limit=4"
        viewAllFilter="popularity"
      />
      <TrustSection />
      <TestimonialsSection />
    </main>
  );
}