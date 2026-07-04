"use client";

import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { BRAND_NAME } from "@/lib/constants";
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
  parsedImages?: string[];
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

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  productCount: number;
}

interface Brand {
  id: string;
  name: string;
  slug: string;
  productCount: number;
}

const defaultAllSizes = ["XS", "S", "M", "L", "XL", "XXL", "28", "30", "32", "34", "36", "ONE SIZE"];
const defaultColorSwatches = [
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

const defaultPriceRanges = [
  { label: "Under \u20B92,000", min: 0, max: 2000 },
  { label: "\u20B92,000 - \u20B95,000", min: 2000, max: 5000 },
  { label: "\u20B95,000 - \u20B910,000", min: 5000, max: 10000 },
  { label: "\u20B910,000 - \u20B920,000", min: 10000, max: 20000 },
  { label: "Over \u20B920,000", min: 20000, max: 99999 },
];

const defaultDiscountOptions = [
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
      <button suppressHydrationWarning
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

function FilterSidebar({
  onClose,
  categories,
  brands,
  shopFilters,
  selectedDiscount,
  setSelectedDiscount,
}: {
  onClose?: () => void;
  categories?: Category[];
  brands?: Brand[];
  shopFilters?: { sizes?: string[]; colors?: { name: string; hex: string }[]; priceRanges?: { label: string; min: number; max: number }[]; discountOptions?: { label: string; value: number }[] };
  selectedDiscount: number | null;
  setSelectedDiscount: (value: number | null) => void;
}) {
  const { filters, setFilter, resetFilters } = useStore();
  const activeCount = useMemo(() => {
    let count = 0;
    if (filters.category.length) count += filters.category.length;
    if (filters.brands.length) count += filters.brands.length;
    if (filters.sizes.length) count += filters.sizes.length;
    if (filters.colors.length) count += filters.colors.length;
    if (filters.ratings > 0) count++;
    if (filters.availability) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 99999) count++;
    return count;
  }, [filters]);

  const toggleArrayFilter = (key: "category" | "brands" | "sizes" | "colors", value: string) => {
    const current = filters[key];
    const updated = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    setFilter(key, updated);
  };

  // Build a map of category name -> productCount from API data
  const categoryCountMap = useMemo(() => {
    const map: Record<string, number> = {};
    if (categories) {
      categories.forEach((c) => { map[c.name] = c.productCount; });
    }
    return map;
  }, [categories]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-[#E8E8E8]">
        <h2 className="text-[15px] font-medium tracking-wide">
          Filters {activeCount > 0 && <span className="text-[#4D5B47]">({activeCount})</span>}
        </h2>
        <div className="flex items-center gap-3">
          {activeCount > 0 && (
            <button suppressHydrationWarning
              onClick={resetFilters}
              className="text-[12px] text-[#4D5B47] hover:text-[#111] transition-colors tracking-wide uppercase"
            >
              Clear All
            </button>
          )}
          {onClose && (
            <button
              suppressHydrationWarning
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin -mx-1 px-1">
        <FilterSection title="Category">
          <div className="space-y-0.5 max-h-48 overflow-y-auto scrollbar-thin">
            {(categories || []).map((cat) => (
              <CheckboxItem
                key={cat.id}
                label={cat.name}
                checked={filters.category.includes(cat.name)}
                onChange={() => toggleArrayFilter("category", cat.name)}
                count={categoryCountMap[cat.name] || 0}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Price Range">
          <div className="space-y-1.5">
            {(shopFilters?.priceRanges || defaultPriceRanges).map((range) => {
              const active = filters.priceRange[0] === range.min && filters.priceRange[1] === range.max;
              return (
                <button suppressHydrationWarning
                  key={range.label}
                  suppressHydrationWarning
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
            {(brands || []).map((brand) => (
              <CheckboxItem
                key={brand.id}
                label={brand.name.replace(`${BRAND_NAME} `, "")}
                checked={filters.brands.includes(brand.name)}
                onChange={() => toggleArrayFilter("brands", brand.name)}
              />
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Size">
          <div className="flex flex-wrap gap-1.5">
            {(shopFilters?.sizes || defaultAllSizes).map((size) => (
              <button suppressHydrationWarning
                key={size}
                suppressHydrationWarning
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
            {(shopFilters?.colors || defaultColorSwatches).map((color) => (
              <button suppressHydrationWarning
                key={color.hex}
                suppressHydrationWarning
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
              <button suppressHydrationWarning
                key={r}
                suppressHydrationWarning
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
            {(shopFilters?.discountOptions || defaultDiscountOptions).map((opt) => (
              <CheckboxItem
                key={opt.value}
                label={opt.label}
                checked={selectedDiscount === opt.value}
                onChange={() => setSelectedDiscount(selectedDiscount === opt.value ? null : opt.value)}
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
  const images = product.parsedImages || [product.image];
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

export default function ShopPage() {
  const { filters, setFilter, resetFilters, searchQuery, navigate, goBack } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [mobileFilters, setMobileFilters] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [mobileSortOpen, setMobileSortOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [shopFilters, setShopFilters] = useState<{ sizes?: string[]; colors?: { name: string; hex: string }[]; priceRanges?: { label: string; min: number; max: number }[]; discountOptions?: { label: string; value: number }[] }>({});
  const [selectedDiscount, setSelectedDiscount] = useState<number | null>(null);
  const productGridRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const limit = 12;

  // Fetch categories, brands, and shop filters on mount
  useEffect(() => {
    Promise.all([
      fetch("/api/categories?withCounts=true").then((r) => r.json()),
      fetch("/api/brands").then((r) => r.json()),
      fetch("/api/site-content").then((r) => r.json()),
    ]).then(([catData, brandData, contentData]) => {
      setCategories(catData.categories || []);
      setBrands(brandData.brands || []);
      try {
        if (contentData.content?.shopFilters) setShopFilters(JSON.parse(contentData.content.shopFilters));
      } catch {}
    }).catch(() => {});
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters, searchQuery]);

  // Fetch products
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();

    if (filters.category.length) params.set("categories", filters.category.join(","));
    if (filters.brands.length) params.set("brands", filters.brands.join(","));
    if (filters.sizes.length) params.set("sizes", filters.sizes.join(","));
    if (filters.colors.length) params.set("colors", filters.colors.join(","));
    params.set("minPrice", filters.priceRange[0].toString());
    params.set("maxPrice", filters.priceRange[1].toString());
    if (filters.ratings > 0) params.set("minRating", filters.ratings.toString());
    if (filters.availability) params.set("inStock", "true");
    if (selectedDiscount) params.set("minDiscount", String(selectedDiscount));
    if (filters.search) params.set("search", filters.search);
    if (searchQuery) params.set("search", searchQuery);

    const sortMap: Record<string, string> = {
      "popularity": "popularity",
      "newest": "newest",
      "price-low": "price-low",
      "price-high": "price-high",
      "rating": "rating",
    };
    params.set("sort", sortMap[filters.sortBy] || "popularity");
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    try {
      const res = await fetch(`/api/products?${params}`);
      const data = await res.json();
      const parsed = (data.products || []).map((p: any) => ({
        ...p,
        parsedImages: p.images ? JSON.parse(p.images) : [p.image],
      }));
      setProducts(parsed);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [filters, searchQuery, page, selectedDiscount]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [filters, searchQuery, page, fetchProducts]);

  // Scroll to top of product grid when page changes
  useEffect(() => {
    if (productGridRef.current) {
      productGridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  const sortOptions = [
    { label: "Popularity", value: "popularity" },
    { label: "Price: Low to High", value: "price-low" },
    { label: "Price: High to Low", value: "price-high" },
    { label: "Newest First", value: "newest" },
    { label: "Best Rating", value: "rating" },
  ];

  const activeFilterTags = useMemo(() => {
    const tags: { label: string; onRemove: () => void }[] = [];
    filters.category.forEach((c) => tags.push({ label: c, onRemove: () => setFilter("category", filters.category.filter((v) => v !== c)) }));
    filters.brands.forEach((b) => tags.push({ label: b, onRemove: () => setFilter("brands", filters.brands.filter((v) => v !== b)) }));
    filters.sizes.forEach((s) => tags.push({ label: `Size: ${s}`, onRemove: () => setFilter("sizes", filters.sizes.filter((v) => v !== s)) }));
    filters.colors.forEach((c) => tags.push({ label: c, onRemove: () => setFilter("colors", filters.colors.filter((v) => v !== c)) }));
    if (searchQuery) tags.push({ label: `"${searchQuery}"`, onRemove: () => setFilter("search", "") });
    return tags;
  }, [filters, searchQuery, setFilter]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.category.length) count += filters.category.length;
    if (filters.brands.length) count += filters.brands.length;
    if (filters.sizes.length) count += filters.sizes.length;
    if (filters.colors.length) count += filters.colors.length;
    if (filters.ratings > 0) count++;
    if (filters.availability) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 99999) count++;
    if (selectedDiscount) count++;
    return count;
  }, [filters, selectedDiscount]);

  const handleBrowseCategory = (cat: string) => {
    resetFilters();
    setFilter("category", [cat]);
  };

  // Compute the "showing X-Y of Z" text
  const showingStart = total > 0 ? (page - 1) * limit + 1 : 0;
  const showingEnd = Math.min(page * limit, total);
  const showingText = !loading && total > 0
    ? `Showing ${showingStart}–${showingEnd} of ${total} products`
    : loading ? "Loading products..." : "";

  // Build page numbers for pagination with windowing
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const pages: number[] = [];
    if (page <= 3) {
      for (let i = 1; i <= 5; i++) pages.push(i);
      pages.push(-1); // ellipsis
      pages.push(totalPages);
    } else if (page >= totalPages - 2) {
      pages.push(1);
      pages.push(-1);
      for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(-1);
      for (let i = page - 1; i <= page + 1; i++) pages.push(i);
      pages.push(-1);
      pages.push(totalPages);
    }
    return pages;
  }, [page, totalPages]);

  // Suggested categories from API data
  const suggestedCategories = categories
    .filter((c) => c.productCount > 0)
    .slice(0, 3)
    .map((c) => c.name);

  return (
    <main className="min-h-screen bg-[#F8F8F6] pt-4 pb-20 lg:pb-16">
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
                <button suppressHydrationWarning
                  onClick={() => setMobileFilters(false)}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterSidebar onClose={() => setMobileFilters(false)} categories={categories} brands={brands} shopFilters={shopFilters} selectedDiscount={selectedDiscount} setSelectedDiscount={setSelectedDiscount} />
              </div>
              <div className="p-4 border-t border-[#E8E8E8]">
                <button suppressHydrationWarning
                  onClick={() => setMobileFilters(false)}
                  className="w-full py-3 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase rounded-[4px]"
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
                <button suppressHydrationWarning
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
                <button suppressHydrationWarning
                  onClick={() => setMobileSortOpen(false)}
                  className="w-8 h-8 flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-2">
                {sortOptions.map((opt) => (
                  <button suppressHydrationWarning
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

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <div className="py-8 border-b border-[#E8E8E8]">
          <button suppressHydrationWarning
            onClick={goBack}
            className="flex items-center gap-1.5 text-[12px] tracking-widest uppercase text-[#999] hover:text-[#111] transition-colors mb-4">
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
              <div className="hidden sm:flex items-center border border-[#E8E8E8] rounded-[4px] overflow-hidden">
                <button suppressHydrationWarning
                  onClick={() => setViewMode("grid")}
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${
                    viewMode === "grid" ? "bg-[#111] text-[#F8F8F6]" : "text-[#666] hover:text-[#111]"
                  }`}
                  title="Grid view"
                >
                  <Grid3X3 className="w-3.5 h-3.5" />
                </button>
                <button suppressHydrationWarning
                  onClick={() => setViewMode("list")}
                  className={`w-9 h-9 flex items-center justify-center transition-colors ${
                    viewMode === "list" ? "bg-[#111] text-[#F8F8F6]" : "text-[#666] hover:text-[#111]"
                  }`}
                  title="List view"
                >
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
              <button suppressHydrationWarning
                onClick={() => setMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-3 py-2 border border-[#E8E8E8] text-[12px] tracking-wide uppercase relative"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#4D5B47] text-[#F8F8F6] text-[9px] font-medium rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button suppressHydrationWarning
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
            <div className="flex sm:hidden items-center border border-[#E8E8E8] rounded-[4px]">
              <button suppressHydrationWarning
                onClick={() => setViewMode("grid")}
                className={`w-8 h-8 flex items-center justify-center transition-colors ${
                  viewMode === "grid" ? "bg-[#111] text-[#F8F8F6]" : "text-[#666] hover:text-[#111]"
                }`}
              >
                <Grid3X3 className="w-3 h-3" />
              </button>
              <button suppressHydrationWarning
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
                <button suppressHydrationWarning
                  onClick={tag.onRemove}
                  className="w-5 h-5 flex items-center justify-center rounded-[2px] hover:bg-[#E8E8E8] hover:text-[#C53030] transition-all hover:scale-110"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
            <button suppressHydrationWarning
              onClick={resetFilters}
              className="text-[12px] text-[#4D5B47] hover:text-[#111] transition-colors tracking-wide uppercase ml-2">
              Clear All
            </button>
          </div>
        )}

        {/* Main Content */}
        <div className="flex gap-8 py-6">
          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-[260px] flex-shrink-0">
            <div className="sticky top-[88px]">
              <FilterSidebar categories={categories} brands={brands} shopFilters={shopFilters} selectedDiscount={selectedDiscount} setSelectedDiscount={setSelectedDiscount} />
            </div>
          </div>

          {/* Product Grid / List */}
          <div className="flex-1 min-w-0 pb-20 lg:pb-0" ref={productGridRef}>
            {loading ? (
              viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
                  {Array.from({ length: 12 }).map((_, i) => (
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
                  <button suppressHydrationWarning
                    onClick={resetFilters}
                    className="px-6 py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors rounded-[4px]"
                  >
                    Clear Filters
                  </button>
                  <button suppressHydrationWarning
                    onClick={() => { resetFilters(); }}
                    className="px-6 py-2.5 border border-[#E8E8E8] text-[#111] text-[12px] font-medium tracking-widest uppercase hover:border-[#999] transition-colors"
                  >
                    Browse Categories
                  </button>
                </div>
                {/* Suggested category pills */}
                {suggestedCategories.length > 0 && (
                  <div className="flex items-center gap-2 mt-6 flex-wrap justify-center">
                    <span className="text-[11px] text-[#999] tracking-wide uppercase mr-1">Try:</span>
                    {suggestedCategories.map((cat) => (
                      <button suppressHydrationWarning
                        key={cat}
                        onClick={() => handleBrowseCategory(cat)}
                        className="px-3.5 py-1.5 border border-[#E8E8E8] text-[11px] text-[#666] tracking-wide hover:border-[#4D5B47] hover:text-[#4D5B47] transition-colors rounded-[4px]"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5 lg:gap-6">
                    <AnimatePresence mode="popLayout">
                      {products.map((p, i) => (
                        <ProductCard
                          key={p.id}
                          id={p.id}
                          name={p.name}
                          price={p.price}
                          mrp={p.mrp}
                          image={p.image}
                          images={p.parsedImages}
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
                    <button suppressHydrationWarning
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="w-9 h-9 flex items-center justify-center text-[13px] disabled:opacity-30 text-[#666] hover:text-[#111] transition-colors"
                    >
                      &lt;
                    </button>
                    {pageNumbers.map((p, i) =>
                      p === -1 ? (
                        <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-[13px] text-[#999]">
                          ...
                        </span>
                      ) : (
                        <button suppressHydrationWarning
                          key={p}
                          onClick={() => setPage(p)}
                          className={`w-9 h-9 flex items-center justify-center text-[13px] transition-colors ${
                            page === p
                              ? "bg-[#111] text-white"
                              : "text-[#666] hover:text-[#111]"
                          }`}
                        >
                          {p}
                        </button>
                      )
                    )}
                    <button suppressHydrationWarning
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="w-9 h-9 flex items-center justify-center text-[13px] disabled:opacity-30 text-[#666] hover:text-[#111] transition-colors"
                    >
                      &gt;
                    </button>
                  </div>
                )}

                {/* Page X of Y text */}
                {totalPages > 1 && (
                  <p className="text-center text-[13px] text-[#999] mt-3">
                    Page {page} of {totalPages}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Sticky Mobile Filter Bar */}
      <AnimatePresence>
        {!loading && products.length > 0 && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-[#E8E8E8] z-[55] lg:hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 gap-3">
              <button suppressHydrationWarning
                onClick={() => setMobileFilters(true)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-[#E8E8E8] text-[12px] tracking-wide uppercase hover:border-[#999] transition-colors"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Filters
              </button>
              <button suppressHydrationWarning
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