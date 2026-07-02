"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, TrendingUp } from "lucide-react";
import { useStore } from "@/lib/store";

const trendingSearches = ["Cashmere", "Blazer", "Chelsea Boots", "Selvedge Denim", "Linen"];

export function SearchOverlay() {
  const { isSearchOpen, setSearchOpen, setSearchQuery, navigate } = useStore();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const prevOpenRef = useRef(false);

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
            className="fixed top-0 left-0 right-0 z-[90] bg-[#F8F8F6]"
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
                  className="flex-1 bg-transparent text-[16px] text-[#111] placeholder:text-[#999] outline-none"
                />
                <button
                  onClick={() => setSearchOpen(false)}
                  className="w-9 h-9 flex items-center justify-center hover:opacity-60 transition-opacity"
                >
                  <X className="w-5 h-5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="py-6">
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
                      className="px-4 py-2 text-[13px] text-[#666] bg-[#F0EFED] hover:bg-[#E8E8E8] transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}