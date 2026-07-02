"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/shared/ProductCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import { Heart, ChevronRight } from "lucide-react";

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

export default function WishlistPage() {
  const { wishlistItems, navigate, toggleWishlist } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (wishlistItems.length === 0) {
      queueMicrotask(() => setLoading(false));
      return;
    }
    queueMicrotask(() => setLoading(true));
    fetch("/api/products?limit=50")
      .then((r) => r.json())
      .then((data) => {
        const filtered = (data.products || []).filter((p: Product) => wishlistItems.includes(p.id));
        setProducts(filtered);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [wishlistItems]);

  return (
    <main className="min-h-screen bg-[#F8F8F6] pt-20 pb-16">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 py-4 text-[12px] text-[#999]">
          <button onClick={() => navigate("home")} className="hover:text-[#111] transition-colors">Home</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#111]">Wishlist</span>
        </nav>

        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">Wishlist</h1>
            <p className="text-[14px] text-[#999] mt-1">
              {wishlistItems.length} item{wishlistItems.length !== 1 ? "s" : ""} saved
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <button
              onClick={() => wishlistItems.forEach((id) => toggleWishlist(id))}
              className="text-[12px] text-[#999] hover:text-[#C53030] transition-colors tracking-wide uppercase"
            >
              Clear All
            </button>
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
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <Heart className="w-16 h-16 text-[#D1D1D1] mb-6" strokeWidth={1} />
            <h2 className="text-[24px] font-medium tracking-[-0.02em] mb-2">Your wishlist is empty</h2>
            <p className="text-[14px] text-[#999] mb-8">Save items you love for later</p>
            <button
              onClick={() => navigate("shop")}
              className="px-8 py-3.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-[0.15em] uppercase hover:bg-[#333] transition-colors"
            >
              Explore Products
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6">
            <AnimatePresence>
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
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}