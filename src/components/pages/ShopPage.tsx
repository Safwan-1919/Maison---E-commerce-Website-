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
  { label: "Under ₹2,000", min: 0, max: 2000 },
  { label: "₹2,000 - ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
  { label: "₹10,000 - ₹20,000", min: 10000, max: 20000 },
  { label: "Over ₹20,000", min: 20000, max: 999999 },
];

const discountOptions = [
  { label: "10% or more", value: 10 },
  { label: "20% or more", value: 20 },
  { label: "30% or more", value: 30 },
];

// Inline shimmer keyframes for skeleton enhancement
const shimmerStyle = {
  background: "linear-gradient(90deg, #F0EFED 0%, #E2E1DF 20%, #EDECEA 40%, #F5F4F2 60%, #E2E1DF 80%, #F0EFED 100%)",
  backgroundSize: "400% 100%",
  animation: "shimmer-enhanced 2s ease-in-out infinite",
};

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

function CheckboxItem({ label, checked, onChange, count }: { label: string; checked: boolean; onChange: () => void; count?: number }) {
  return (
    <label className="flex items-center justify-between py-1 cursor-pointer group">
      <div className="flex items-center gap-2.5">
        <div
          className={`w-4 h-4 border flex items-center justify-center transition-colors ${
            checked ? "bg-[#111] border-[#111]" : "border-[#D1D1D1] group-hover:border-[#999]"
          }`}
          onClick={(e) => { e.preventDefault(); onChange(); }}
        >
          {checked && <Check className="w-2.5 h-2.5 text-[#F8F8F6]" />}
        </div>
        <span className="text-[13px] text-[#333] group-hover:text-[#111] transition-colors">{label}</span>
      </div>
      {count !== undefined && (
        <span className="text-[11px] text-[#999] tabular-nums">{count}</span>
      )}
    </label>
  );
}

function FilterSidebar({ onClose, products }: { onClose?: () => void; products?: Product[] }) {
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

  // Count products per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (products && products.length > 0) {
      products.forEach((p) => {
        counts[p.category] = (counts[p.category] || 0) + 1;
      });
    }
    return counts;
  }, [products]);

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
                count={categoryCounts[cat] || 0}
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

// List view product card (horizontal layout)
function ProductListItem({ product, index }: { product: Product; index: number }) {
  const { navigate } = useStore();
  const images = product.images ? JSON.parse(product.images) : [product.image];
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
      onClick={() => navigate("product", product.id)}
      className="flex gap-5 p-3 border border-[#E8E8E8] bg-white cursor-pointer group hover:border-[#ccc] transition-colors rounded-[4px]"
    >
      {/* Image */}
      <div className="w-[140px] sm:w-[180px] flex-shrink-0 aspect-[3/4] relative overflow-hidden rounded-[4px] bg-[#F0EFED]">
        {!imgLoaded && (
          <div className="absolute inset-0 skeleton-shimmer" />
        )}
        <img
          src={images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          onLoad={() => setImgLoaded(true)}
        />
        {product.discount > 0 && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-[#111] text-[#F8F8F6] text-[10px] tracking-wide uppercase">
            -{product.discount}%
          </span>
        )}
      </div>
      {/* Details */}
      <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
        <div>
          <p className="text-[11px] text-[#999] tracking-widest uppercase mb-1">{product.brand}</p>
          <h3 className="text-[14px] sm:text-[15px] font-medium text-[#111] leading-snug line-clamp-2 group-hover:text-[#4D5B47] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-2">
            <Star className="w-3 h-3 fill-[#111] text-[#111]" />
            <span className="text-[12px] text-[#333]">{product.rating}</span>
            <span className="text-[11px] text-[#999]">({product.reviewCount})</span>
          </div>
          <p className="text-[11px] text-[#999] mt-1 tracking-wide uppercase">{product.category}</p>
        </div>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-[16px] font-medium text-[#111]">₹{product.price.toLocaleString()}</span>
          {product.mrp > product.price && (
            <span className="text-[13px] text-[#999] line-through">₹{product.mrp.toLocaleString()}</span>
          )}
          {product.discount > 0 && (
            <span className="text-[11px] text-[#4D5B47] font-medium">{product.discount}% off</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          {product.isNew && (
            <span className="px-2 py-0.5 border border-[#4D5B47] text-[10px] text-[#4D5B47] tracking-wide uppercase">New</span>
          )}
          {product.isBestSeller && (
            <span className="px-2 py-0.5 border border-[#B79B7B] text-[10px] text-[#B79B7B] tracking-wide uppercase">Best Seller</span>
          )}
          {product.isTrending && (
            <span className="px-2 py-0.5 border border-[#999] text-[10px] text-[#666] tracking-wide uppercase">Trending</span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const suggestedCategories = ["T-Shirts", "Footwear", "Accessories"];

export default function ShopPage() {
  const { filters, setFilter, resetFilters, searchQuery, navigate, goBack } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
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

  const handleBrowseCategory = (cat: string) => {
    resetFilters();
    setFilter("category", [cat]);
  };

  // Compute the "showing X of Y" text
  const showingText = !loading && total > 0
    ? `Showing ${products.length} of ${total} products`
    : loading ? "Loading products..." : "";

  return (
    <main className="min-h-screen bg-[#F8F8F6] pt-20 pb-20 lg:pb-0">
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
                <FilterSidebar onClose={() => setMobileFilters(false)} products={products} />
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

      {/* Sort Dropdown (Desktop) */}
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

      {/* Mobile Sort Dropdown */}
      <AnimatePresence>
        {mobileSortOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[80] lg:hidden"
              onClick={() => setMobileSortOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#F8F8F6] z-[90] lg:hidden max-h-[50vh] flex flex-col"
            >
              <div className="p-4 border-b border-[#E8E8E8] flex items-center justify-between">
                <h3 className="text-[15px] font-medium">Sort By</h3>
                <button onClick={() => setMobileSortOpen(false)} className="w-8 h-8 flex items-center justify-center">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {sortOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => { setFilter("sortBy", opt.value); setMobileSortOpen(false); }}
                    className={`block w-full text-left px-6 py-3 text-[13px] transition-colors ${
                      filters.sortBy === opt.value ? "text-[#4D5B47] font-medium" : "text-[#666] hover:text-[#111]"
                    }`}
                  >
                    {opt.label}
                    {filters.sortBy === opt.value && <Check className="w-3.5 h-3.5 inline ml-2" />}
                  </button>
                ))}
              </div>
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
              {/* View Mode Toggle (Desktop) */}
              <div className="hidden sm:flex items-center border border-[#E8E8E8]">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${
                    viewMode === "grid" ? "bg-[#111] text-[#F8F8F6]" : "text-[#666] hover:text-[#111]"
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${
                    viewMode === "list" ? "bg-[#111] text-[#F8F8F6]" : "text-[#666] hover:text-[#111]"
                  }`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
              <button
                onClick={() => setMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#E8E8E8] text-[12px] tracking-wide uppercase"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
              <button
                onClick={() => setSortOpen(!sortOpen)}
                className="hidden lg:flex items-center gap-2 px-3 py-2 border border-[#E8E8E8] text-[12px] tracking-wide uppercase hover:border-[#999] transition-colors relative"
              >
                Sort
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Header Enhancement — Divider + "Showing X of Y" */}
        {!loading && products.length > 0 && (
          <div className="flex items-center justify-between py-3">
            <p className="text-[12px] text-[#999] tracking-wide">{showingText}</p>
            {/* Mobile view mode toggle */}
            <div className="flex sm:hidden items-center border border-[#E8E8E8]">
              <button
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${
                  viewMode === "grid" ? "bg-[#111] text-[#F8F8F6]" : "text-[#666] hover:text-[#111]"
                }`}
              >
                <Grid3X3 className="w-3 h-3" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${
                  viewMode === "list" ? "bg-[#111] text-[#F8F8F6]" : "text-[#666] hover:text-[#111]"
                }`}
              >
                <List className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Active Filters */}
        {activeFilterTags.length > 0 && (
          <div className="flex items-center gap-2 py-3 flex-wrap">
            {activeFilterTags.map((tag) => (
              <motion.span
                key={tag.label}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 bg-[#F0EFED] text-[12px] text-[#111] border-l-2 border-l-[#4D5B47] rounded-[4px]"
              >
                {tag.label}
                <button
                  onClick={tag.onRemove}
                  className="w-5 h-5 flex items-center justify-center rounded-[2px] hover:bg-[#E8E8E8] hover:text-[#C53030] transition-all hover:scale-110"
                >
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
        <div className="flex gap-8 py-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-[240px] flex-shrink-0">
            <div className="sticky top-[88px]">
              <FilterSidebar products={products} />
            </div>
          </div>

          {/* Product Grid / List */}
          <div className="flex-1 min-w-0">
            {loading ? (
              viewMode === "grid" ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-5">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="space-y-3">
                      <div
                        className="aspect-[3/4] rounded-[4px]"
                        style={shimmerStyle}
                      />
                      <div className="h-3 w-16 rounded-[4px]" style={shimmerStyle} />
                      <div className="h-4 w-full rounded-[4px]" style={shimmerStyle} />
                      <div className="h-4 w-20 rounded-[4px]" style={shimmerStyle} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-5 p-3 border border-[#E8E8E8] rounded-[4px]">
                      <div
                        className="w-[140px] sm:w-[180px] flex-shrink-0 aspect-[3/4] rounded-[4px]"
                        style={shimmerStyle}
                      />
                      <div className="flex-1 py-2 space-y-3">
                        <div className="h-3 w-20 rounded-[4px]" style={shimmerStyle} />
                        <div className="h-4 w-3/4 rounded-[4px]" style={shimmerStyle} />
                        <div className="h-4 w-1/2 rounded-[4px]" style={shimmerStyle} />
                        <div className="h-4 w-24 rounded-[4px]" style={shimmerStyle} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            ) : products.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-24 text-center border-l-2 border-l-[#4D5B47] pl-8 sm:pl-12 ml-0"
              >
                <div className="w-16 h-16 bg-[#F0EFED] rounded-full flex items-center justify-center mb-4">
                  <SlidersHorizontal className="w-6 h-6 text-[#999]" strokeWidth={1.5} />
                </div>
                <p className="text-[16px] text-[#111] mb-1">No products found</p>
                <p className="text-[13px] text-[#999] mb-6">Try adjusting your filters or search query</p>
                <div className="flex items-center gap-3 flex-wrap justify-center">
                  <button
                    onClick={resetFilters}
                    className="px-6 py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={() => { resetFilters(); }}
                    className="px-6 py-2.5 border border-[#E8E8E8] text-[#111] text-[12px] font-medium tracking-widest uppercase hover:border-[#999] transition-colors"
                  >
                    Browse Categories
                  </button>
                </div>
                {/* Suggested category pills */}
                <div className="flex items-center gap-2 mt-6 flex-wrap justify-center">
                  <span className="text-[11px] text-[#999] tracking-wide uppercase mr-1">Try:</span>
                  {suggestedCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleBrowseCategory(cat)}
                      className="px-3.5 py-1.5 border border-[#E8E8E8] text-[11px] text-[#666] tracking-wide hover:border-[#4D5B47] hover:text-[#4D5B47] transition-colors rounded-[4px]"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
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
                ) : (
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {products.map((p, i) => (
                        <ProductListItem key={p.id} product={p} index={i} />
                      ))}
                    </AnimatePresence>
                  </div>
                )}

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

      {/* Sticky Mobile Filter Bar */}
      <AnimatePresence>
        {!loading && products.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#E8E8E8] z-[50] lg:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <button
                onClick={() => setMobileFilters(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#E8E8E8] text-[12px] tracking-wide uppercase hover:border-[#999] transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
              <button
                onClick={() => setMobileSortOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] tracking-wide uppercase hover:bg-[#333] transition-colors"
              >
                Sort
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}