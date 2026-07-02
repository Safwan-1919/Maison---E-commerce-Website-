"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/shared/ProductCard";
import { ScrollReveal } from "@/components/shared/ScrollReveal";
import {
  SlidersHorizontal, X, ChevronDown, ChevronUp, Grid3X3, List,
  ArrowUp, Star, Check
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
  stock: number;
}

const allCategories = ["T-Shirts", "Shirts", "Blazers", "Sweaters", "Jeans", "Trousers", "Outerwear", "Footwear", "Bags", "Accessories"];
const allBrands = ["MAISON Essentials", "MAISON Tailored", "MAISON Denim", "MAISON Knitwear", "MAISON Footwear", "MAISON Outerwear", "MAISON Accessories", "MAISON Leather", "MAISON Timepieces"];
const allSizes = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "ONE SIZE"];
const colorSwatches = [
  { name: "White", hex: "#FFFFFF" },
  { name: "Black", hex: "#111111" },
  { name: "Olive", hex: "#4D5B47" },
  { name: "Sand", hex: "#B79B7B" },
  { name: "Cream", hex: "#D4C4B0" },
  { name: "Navy", hex: "#1a2744" },
  { name: "Charcoal", hex: "#3a3a3a" },
  { name: "Gray", hex: "#6B6B6B" },
  { name: "Brown", hex: "#5C3D2E" },
  { name: "Tan", hex: "#8B6914" },
  { name: "Sage", hex: "#B7C4B5" },
  { name: "Ivory", hex: "#F5F0E8" },
];

const priceRanges = [
  { label: "Under \u20B92,000", min: 0, max: 2000 },
  { label: "\u20B92,000 - \u20B95,000", min: 2000, max: 5000 },
  { label: "\u20B95,000 - \u20B910,000", min: 5000, max: 10000 },
  { label: "\u20B910,000 - \u20B920,000", min: 10000, max: 20000 },
  { label: "Over \u20B920,000", min: 20000, max: 999999 },
];

const discountOptions = [
  { label: "10% or more", value: 10 },
  { label: "20% or more", value: 20 },
  { label: "30% or more", value: 30 },
];

function FilterSection({ title, children, defaultOpen = true }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[#E8E8E8]">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full py-3 text-[13px] font-medium tracking-wide text-[#111] hover:text-[#666] transition-colors"
      >
        {title}
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CheckboxItem({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <div
        className={`w-4 h-4 border flex items-center justify-center transition-colors ${
          checked ? "bg-[#111] border-[#111]" : "border-[#D1D1D1] group-hover:border-[#999]"
        }`}
        onClick={(e) => { e.preventDefault(); onChange(); }}
      >
        {checked && <Check className="w-2.5 h-2.5 text-[#F8F8F6]" />}
      </div>
      <span className="text-[13px] text-[#333] group-hover:text-[#111] transition-colors">{label}</span>
    </label>
  );
}

function FilterSidebar({ onClose }: { onClose?: () => void }) {
  const { filters, setFilter, resetFilters } = useStore();
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.category.length) count += filters.category.length;
    if (filters.brands.length) count += filters.brands.length;
    if (filters.sizes.length) count += filters.sizes.length;
    if (filters.colors.length) count += filters.colors.length;
    if (filters.ratings > 0) count++;
    if (filters.availability) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 999999) count++;
    return count;
  }, [filters]);

  const toggleArrayFilter = (key: "category" | "brands" | "sizes" | "colors", value: string) => {
    const current = filters[key];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setFilter(key, updated);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E8]">
        <h2 className="text-[15px] font-medium tracking-wide">
          Filters {activeCount > 0 && <span className="text-[#4D5B47]">({activeCount})</span>}
        </h2>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button onClick={resetFilters} className="text-[12px] text-[#4D5B47] hover:text-[#111] transition-colors tracking-wide uppercase">
              Clear All
            </button>
          )}
          {onClose && (
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin -mx-1 px-1">
        <FilterSection title="Category">
          <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin">
            {allCategories.map((cat) => (
              <CheckboxItem
                key={cat}
                label={cat}
                checked={filters.category.includes(cat)}
                onChange={() => toggleArrayFilter("category", cat)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Price Range">
          <div className="space-y-1.5">
            {priceRanges.map((range) => {
              const active = filters.priceRange[0] === range.min && filters.priceRange[1] === range.max;
              return (
                <button
                  key={range.label}
                  onClick={() => setFilter("priceRange", [range.min, range.max])}
                  className={`block w-full text-left text-[13px] py-1 transition-colors ${
                    active ? "text-[#111] font-medium" : "text-[#666] hover:text-[#111]"
                  }`}
                >
                  {range.label}
                </button>
              );
            })}
          </div>
        </FilterSection>

        <FilterSection title="Brand">
          <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin">
            {allBrands.map((brand) => (
              <CheckboxItem
                key={brand}
                label={brand.replace("MAISON ", "")}
                checked={filters.brands.includes(brand)}
                onChange={() => toggleArrayFilter("brands", brand)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Size">
          <div className="flex flex-wrap gap-1.5">
            {allSizes.map((size) => (
              <button
                key={size}
                onClick={() => toggleArrayFilter("sizes", size)}
                className={`px-3 py-1.5 text-[12px] border transition-colors ${
                  filters.sizes.includes(size)
                    ? "bg-[#111] text-[#F8F8F6] border-[#111]"
                    : "border-[#E8E8E8] text-[#666] hover:border-[#999] hover:text-[#111]"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Color">
          <div className="flex flex-wrap gap-2">
            {colorSwatches.map((color) => (
              <button
                key={color.hex}
                onClick={() => toggleArrayFilter("colors", color.name)}
                className={`w-7 h-7 border-2 transition-all ${
                  filters.colors.includes(color.name) ? "border-[#111] scale-110" : "border-transparent hover:border-[#D1D1D1]"
                }`}
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Rating">
          <div className="space-y-1.5">
            {[4, 3, 2].map((r) => (
              <button
                key={r}
                onClick={() => setFilter("ratings", filters.ratings === r ? 0 : r)}
                className={`flex items-center gap-1.5 text-[13px] transition-colors ${
                  filters.ratings === r ? "text-[#111] font-medium" : "text-[#666] hover:text-[#111]"
                }`}
              >
                {r} <Star className="w-3 h-3 fill-[#111] text-[#111]" /> &amp; above
              </button>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Discount">
          <div className="space-y-1.5">
            {discountOptions.map((opt) => (
              <CheckboxItem
                key={opt.value}
                label={opt.label}
                checked={filters.ratings === 0 ? false : false}
                onChange={() => {}}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Availability" defaultOpen={false}>
          <CheckboxItem
            label="In Stock Only"
            checked={filters.availability}
            onChange={() => setFilter("availability", !filters.availability)}
          />
        </FilterSection>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const { filters, setFilter, resetFilters, searchQuery, navigate, goBack } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const limit = 20;

  const fetchProducts = useCallback(async () => {
    queueMicrotask(() => setLoading(true));
    const params = new URLSearchParams();
    if (filters.category.length === 1) params.set("category", filters.category[0]);
    if (filters.brands.length === 1) params.set("brand", filters.brands[0]);
    if (searchQuery) params.set("search", searchQuery);
    params.set("sort", filters.sortBy);
    params.set("minPrice", filters.priceRange[0].toString());
    params.set("maxPrice", filters.priceRange[1].toString());
    params.set("limit", limit.toString());
    params.set("page", page.toString());

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      let filtered = data.products || [];

      // Client-side filtering for arrays
      if (filters.category.length > 1) {
        filtered = filtered.filter((p: Product) => filters.category.includes(p.category));
      }
      if (filters.brands.length > 1) {
        filtered = filtered.filter((p: Product) => filters.brands.includes(p.brand));
      }
      if (filters.ratings > 0) {
        filtered = filtered.filter((p: Product) => p.rating >= filters.ratings);
      }
      if (filters.availability) {
        filtered = filtered.filter((p: Product) => p.stock > 0);
      }
      if (filters.sizes.length > 0) {
        filtered = filtered.filter((p: Product) => {
          try {
            const sizes = JSON.parse(p.images ? "" : "[]");
            return true; // Simplified - sizes stored as JSON in sizes field
          } catch { return true; }
        });
      }

      setProducts(filtered);
      setTotal(data.total || filtered.length);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filters, searchQuery, page]);

  useEffect(() => { const id = setTimeout(fetchProducts, 0); return () => clearTimeout(id); }, [fetchProducts]);

  const sortOptions = [
    { label: "Popularity", value: "popularity" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
    { label: "Newest First", value: "newest" },
    { label: "Best Rating", value: "rating" },
  ];

  const totalPages = Math.ceil(total / limit);

  const activeFilterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    filters.category.forEach((c) => tags.push({ label: c, onRemove: () => setFilter("category", filters.category.filter((v) => v !== c)) }));
    filters.brands.forEach((b) => tags.push({ label: b, onRemove: () => setFilter("brands", filters.brands.filter((v) => v !== b)) }));
    filters.sizes.forEach((s) => tags.push({ label: `Size: ${s}`, onRemove: () => setFilter("sizes", filters.sizes.filter((v) => v !== s)) }));
    filters.colors.forEach((c) => tags.push({ label: c, onRemove: () => setFilter("colors", filters.colors.filter((v) => v !== c)) }));
    if (searchQuery) tags.push({ label: `"${searchQuery}"`, onRemove: () => setFilter("search", "") });
    return tags;
  }, [filters, searchQuery, setFilter]);

  return (
    <main className="min-h-screen bg-[#F8F8F6] pt-20">
      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {mobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[80] lg:hidden"
              onClick={() => setMobileFilters(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#F8F8F6] z-[90] lg:hidden max-h-[85vh] flex flex-col"
            >
              <div className="p-4 border-b border-[#E8E8E8] flex items-center justify-between">
                <h3 className="text-[15px] font-medium">Filters</h3>
                <button onClick={() => setMobileFilters(false)} className="w-8 h-8 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterSidebar onClose={() => setMobileFilters(false)} />
              </div>
              <div className="p-4 border-t border-[#E8E8E8]">
                <button
                  onClick={() => setMobileFilters(false)}
                  className="w-full py-3 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Sort Dropdown */}
      <AnimatePresence>
        {sortOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[70]" onClick={() => setSortOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute right-4 sm:right-8 top-[68px] z-[80] bg-white border border-[#E8E8E8] shadow-lg min-w-[200px] py-1"
            >
              {sortOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => { setFilter("sortBy", opt.value); setSortOpen(false); }}
                  className={`block w-full text-left px-4 py-2.5 text-[13px] transition-colors ${
                    filters.sortBy === opt.value ? "text-[#4D5B47] font-medium" : "text-[#666] hover:text-[#111]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="py-6 border-b border-[#E8E8E8]">
          <button onClick={goBack} className="flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors mb-4">
            <ArrowUp className="w-3 h-3 rotate-[-90deg]" /> Back
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[28px] sm:text-[36px] font-medium tracking-[-0.02em]">
                {searchQuery ? `Search: "${searchQuery}"` : filters.category.length === 1 ? filters.category[0] : "All Products"}
              </h1>
              <p className="text-[13px] text-[#999] mt-1">{total} products</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#E8E8E8] text-[12px] tracking-wide uppercase"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="flex items-center gap-2 px-3 py-2 border border-[#E8E8E8] text-[12px] tracking-wide uppercase hover:border-[#999] transition-colors relative"
              >
                <Grid3X3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sort</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        {activeFilterTags.length > 0 && (
          <div className="flex items-center gap-2 py-4 flex-wrap">
            {activeFilterTags.map((tag) => (
              <motion.span
                key={tag.label}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0EFED] text-[12px] text-[#111]"
              >
                {tag.label}
                <button onClick={tag.onRemove} className="hover:text-[#C53030] transition-colors">
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
            <button onClick={resetFilters} className="text-[12px] text-[#4D5B47] hover:text-[#111] transition-colors tracking-wide uppercase ml-2">
              Clear All
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-8 py-8">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="sticky top-[88px]">
              <FilterSidebar />
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
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
                <div className="w-16 h-16 bg-[#F0EFED] rounded-full flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-6 h-6 text-[#999]" strokeWidth={1.5} />
                </div>
                <p className="text-[16px] text-[#111] mb-1">No products found</p>
                <p className="text-[13px] text-[#999] mb-6">Try adjusting your filters or search query</p>
                <button
                  onClick={resetFilters}
                  className="px-6 py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-5">
                  <AnimatePresence mode="popLayout">
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

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-1 mt-12">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 flex items-center justify-center border border-[#E8E8E8] text-[13px] disabled:opacity-30 hover:border-[#999] transition-colors"
                    >
                      ‹
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 flex items-center justify-center text-[13px] transition-colors ${
                          page === p ? "bg-[#111] text-[#F8F8F6]" : "border border-[#E8E8E8] hover:border-[#999]"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="w-9 h-9 flex items-center justify-center border border-[#E8E8E8] text-[13px] disabled:opacity-30 hover:border-[#999] transition-colors"
                    >
                      ›
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}