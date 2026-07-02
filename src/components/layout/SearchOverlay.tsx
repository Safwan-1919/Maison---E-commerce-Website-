"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp, ArrowRight, Star } from "lucide-react";
import { useStore } from "@/lib/store";

const trendingSearches = ["Cashmere", "Blazer", "Chelsea Boots", "Selvedge Denim", "Linen", "Wool Overcoat"];
const popularCategories = [
  { name: "T-Shirts", count: 2 },
  { name: "Blazers", count: 1 },
  { name: "Footwear", count: 2 },
  { name: "Sweaters", count: 2 },
  { name: "Outerwear", count: 1 },
  { name: "Accessories", count: 2 },
];

export function SearchOverlay() {
  const { isSearchOpen, setSearchOpen, setSearchQuery, navigate } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Array<{ id: string; name: string; price: number; rating: number; category: string; brand: string; image: string; discount: number }>>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isSearchOpen && !prevOpenRef.current) {
      const id = setTimeout(() => {
        inputRef.current?.focus();
        setQuery("");
      }, 0);
      prevOpenRef.current = isSearchOpen;
      return () => clearTimeout(id);
    }
    prevOpenRef.current = isSearchOpen;
  }, [isSearchOpen]);

  const searchProducts = useCallback(async (term: string) => {
    if (term.trim().length < 2) {
      setResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/products?search=${encodeURIComponent(term)}&limit=6`);
      const data = await res.json();
      setResults(
        (data.products || []).map((p: { id: string; name: string; price: number; rating: number; reviewCount: number; category: string; brand: string; images: string; discount: number }) => ({
          id: p.id,
          name: p.name,
          price: p.price,
          rating: p.rating,
          category: p.category,
          brand: p.brand,
          image: p.images ? JSON.parse(p.images)[0] : "",
          discount: p.discount,
        }))
      );
    } catch {
      setResults([]);
    }
    setIsSearching(false);
  }, []);

  useEffect(() => {
    if (!isSearchOpen) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchProducts(query), 200);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, isSearchOpen, searchProducts]);

  const handleSearch = (searchTerm?: string) => {
    const term = searchTerm || query;
    if (term.trim()) {
      setSearchQuery(term);
      setSearchOpen(false);
      navigate("shop");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
    if (e.key === "Escape") setSearchOpen(false);
  };

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-[80]"
            onClick={() => setSearchOpen(false)}
          />
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 left-0 right-0 z-[90] bg-[#F8F8F6] max-h-[90vh] overflow-y-auto scrollbar-thin"
          >
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-4 py-5 border-b border-[#E8E8E8]">
                <Search className="w-5 h-5 text-[#999] flex-shrink-0" strokeWidth={1.5} />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for products, brands, categories..."
                  className="flex-1 bg-transparent text-[16px] text-[#111] placeholder:text-[#D1D1D1] outline-none"
                  autoFocus={false}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-[#E8E8E8] hover:bg-[#D1D1D1] transition-colors"
                  >
                    <X className="w-3 h-3 text-[#666]" />
                  </button>
                )}
                <button
                  onClick={() => setSearchOpen(false)}
                  className="w-9 h-9 flex items-center justify-center hover:opacity-60 transition-opacity"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="py-6">
                {/* Live Results */}
                {query.trim().length >= 2 && (
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[12px] font-medium tracking-wider uppercase text-[#999]">
                        {isSearching ? "Searching..." : `${results.length} results`}
                      </span>
                    </div>
                    {results.length > 0 ? (
                      <div className="space-y-0">
                        {results.map((item, i) => (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2, delay: i * 0.03 }}
                            onClick={() => { setSearchQuery(query); setSearchOpen(false); navigate("product", item.id); }}
                            className="w-full flex items-center gap-4 p-3 hover:bg-[#F0EFED] transition-colors text-left group"
                          >
                            <div className="w-12 h-14 bg-[#F0EFED] flex-shrink-0 overflow-hidden">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="w-full h-full object-cover"
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-[#999] uppercase tracking-wider">{item.brand}</p>
                              <p className="text-[14px] text-[#111] font-medium truncate">{item.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[13px] font-medium">{"\u20B9"}{item.price.toLocaleString("en-IN")}</span>
                                <div className="flex items-center gap-0.5">
                                  <Star className="w-3 h-3 fill-[#111] text-[#111]" />
                                  <span className="text-[11px] text-[#666]">{item.rating}</span>
                                </div>
                              </div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-[#D1D1D1] group-hover:text-[#111] group-hover:translate-x-0.5 transition-all flex-shrink-0" strokeWidth={1.5} />
                          </motion.button>
                        ))}
                        <button
                          onClick={() => handleSearch(query)}
                          className="w-full py-3 text-center text-[12px] tracking-widest uppercase text-[#4D5B47] hover:text-[#111] transition-colors border-t border-[#E8E8E8] mt-1"
                        >
                          View All Results for &ldquo;{query}&rdquo;
                        </button>
                      </div>
                    ) : !isSearching && (
                      <div className="text-center py-8">
                        <p className="text-[14px] text-[#999]">No products found for &ldquo;{query}&rdquo;</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Trending + Categories when no query */}
                {query.trim().length < 2 && (
                  <>
                    <div className="mb-8">
                      <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-3.5 h-3.5 text-[#999]" strokeWidth={1.5} />
                        <span className="text-[12px] font-medium tracking-wider uppercase text-[#999]">
                          Trending Searches
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {trendingSearches.map((term) => (
                          <button
                            key={term}
                            onClick={() => handleSearch(term)}
                            className="px-4 py-2 text-[13px] text-[#666] bg-[#F0EFED] hover:bg-[#E8E8E8] hover:text-[#111] transition-colors"
                          >
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <span className="text-[12px] font-medium tracking-wider uppercase text-[#999]">
                          Popular Categories
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularCategories.map((cat) => (
                          <button
                            key={cat.name}
                            onClick={() => handleSearch(cat.name)}
                            className="flex items-center gap-2 px-4 py-2 text-[13px] text-[#666] bg-[#F0EFED] hover:bg-[#E8E8E8] hover:text-[#111] transition-colors"
                          >
                            {cat.name}
                            <span className="text-[11px] text-[#999]">({cat.count})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}