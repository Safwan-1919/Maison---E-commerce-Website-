"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, GitCompareArrows, Star, Trash2 } from "lucide-react";
import { useStore } from "@/lib/store";

interface ProductData {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  discount: number;
  sizes: string;
  colors: string;
  material?: string;
  stock: number;
}

function CompareContent({ ids }: { ids: string[] }) {
  const [products, setProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(ids.length > 0);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current || ids.length === 0) return;
    hasFetched.current = true;
    Promise.all(ids.map((id) => fetch(`/api/products/${id}`).then((r) => r.json())))
      .then((results) => {
        setProducts(
          results.filter((r) => r.product).map((r) => ({
            ...r.product,
            sizes: r.product.sizes || "[]",
            colors: r.product.colors || "[]",
          }))
        );
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ids]);

  const { removeFromCompare, clearCompare, navigate, setCompareOpen } = useStore();

  const parseList = (str: string): string[] => {
    try {
      const parsed = JSON.parse(str);
      return Array.isArray(parsed) ? parsed : [str];
    } catch {
      return str ? str.split(",") : [];
    }
  };

  const rows = [
    { label: "Price", render: (p: ProductData) => (
      <div className="flex flex-col items-center gap-1">
        <span className="text-[15px] font-medium">{"\u20B9"}{p.price.toLocaleString("en-IN")}</span>
        {p.mrp > p.price && <span className="text-[12px] text-[#999] line-through">{"\u20B9"}{p.mrp.toLocaleString("en-IN")}</span>}
      </div>
    )},
    { label: "Discount", render: (p: ProductData) => (
      <span className="text-[13px] text-[#C53030] font-medium">{p.discount > 0 ? `${Math.round(p.discount)}% Off` : "-"}</span>
    )},
    { label: "Rating", render: (p: ProductData) => (
      <div className="flex items-center gap-1">
        <Star className="w-3.5 h-3.5 fill-[#111] text-[#111]" />
        <span className="text-[13px] font-medium">{p.rating}</span>
        <span className="text-[11px] text-[#999]">({p.reviewCount})</span>
      </div>
    )},
    { label: "Brand", render: (p: ProductData) => (
      <span className="text-[13px] font-medium tracking-wide uppercase">{p.brand}</span>
    )},
    { label: "Category", render: (p: ProductData) => (
      <span className="text-[13px] text-[#666]">{p.category}</span>
    )},
    { label: "Material", render: (p: ProductData) => (
      <span className="text-[13px] text-[#666]">{p.material || "-"}</span>
    )},
    { label: "Sizes", render: (p: ProductData) => (
      <div className="flex flex-wrap gap-1 justify-center max-w-[140px]">
        {parseList(p.sizes).map((s) => (
          <span key={s} className="px-2 py-0.5 text-[11px] border border-[#E8E8E8] text-[#666]">{s}</span>
        ))}
      </div>
    )},
    { label: "Colors", render: (p: ProductData) => (
      <div className="flex gap-1.5 justify-center">
        {parseList(p.colors).map((c) => (
          <span key={c} className="w-5 h-5 border border-[#E8E8E8]" style={{ backgroundColor: c.toLowerCase() }} title={c} />
        ))}
      </div>
    )},
    { label: "Availability", render: (p: ProductData) => (
      <div className="flex items-center gap-1.5">
        <div className={`w-2 h-2 rounded-full ${p.stock > 0 ? "bg-[#4D5B47]" : "bg-[#C53030]"}`} />
        <span className={`text-[13px] ${p.stock > 0 ? "text-[#4D5B47]" : "text-[#C53030]"}`}>
          {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
        </span>
      </div>
    )},
  ];

  if (ids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <GitCompareArrows className="w-12 h-12 text-[#D1D1D1] mb-4" strokeWidth={1} />
        <h3 className="text-[16px] font-medium text-[#111] mb-1">No products to compare</h3>
        <p className="text-[13px] text-[#999] mb-6">Add products to comparison using the compare button</p>
        <button suppressHydrationWarning
          onClick={() => { setCompareOpen(false); navigate("shop"); }}
          className="px-6 py-3 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors"
        >
          Browse Products
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: ids.length }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="aspect-[3/4] bg-[#E8E8E8] animate-pulse" />
            <div className="h-4 bg-[#E8E8E8] animate-pulse w-3/4" />
            <div className="h-3 bg-[#E8E8E8] animate-pulse w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      {/* Product Headers */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {products.map((product) => (
          <motion.div key={product.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="relative group">
            <button suppressHydrationWarning
              onClick={() => removeFromCompare(product.id)}
              className="absolute top-0 right-0 z-10 w-7 h-7 bg-[#F8F8F6] border border-[#E8E8E8] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X className="w-3 h-3" />
            </button>
            <div className="cursor-pointer" onClick={() => { setCompareOpen(false); navigate("product", product.id); }}>
              <div className="relative aspect-[3/4] bg-[#F0EFED] overflow-hidden mb-3">
                <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <p className="text-[11px] font-medium tracking-wider uppercase text-[#999] mb-1">{product.brand}</p>
              <h3 className="text-[14px] font-normal leading-tight text-[#111] line-clamp-2 min-h-[2.5em]">{product.name}</h3>
            </div>
          </motion.div>
        ))}
        {Array.from({ length: Math.max(0, 4 - products.length) }).map((_, i) => (
          <div key={`empty-${i}`} className="aspect-[3/4] border-2 border-dashed border-[#E8E8E8] flex items-center justify-center">
            <div className="text-center">
              <GitCompareArrows className="w-6 h-6 text-[#D1D1D1] mx-auto mb-2" strokeWidth={1} />
              <p className="text-[12px] text-[#999]">Add product</p>
            </div>
          </div>
        ))}
      </div>

      {/* Comparison Table */}
      <div className="border border-[#E8E8E8] bg-white overflow-x-auto">
        {rows.map((row, i) => (
          <motion.div
            key={row.label}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: i * 0.04 }}
            className="border-b border-[#E8E8E8] last:border-b-0"
            style={{ display: "grid", gridTemplateColumns: `minmax(120px, 160px) repeat(${products.length}, minmax(140px, 1fr))` }}
          >
            <div className="px-4 py-3.5 bg-[#FAFAF8] border-r border-[#E8E8E8]">
              <span className="text-[12px] font-medium tracking-wider uppercase text-[#999]">{row.label}</span>
            </div>
            {products.map((product) => (
              <div key={product.id} className="px-4 py-3.5 flex items-center justify-center border-r border-[#E8E8E8] last:border-r-0">
                {row.render(product)}
              </div>
            ))}
          </motion.div>
        ))}
      </div>
    </>
  );
}

export function CompareDrawer() {
  const { compareItems, isCompareOpen, setCompareOpen, clearCompare } = useStore();

  return (
    <AnimatePresence>
      {isCompareOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
            onClick={() => setCompareOpen(false)}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[90vw] lg:w-[85vw] bg-[#F8F8F6] z-[90] overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#F8F8F6] border-b border-[#E8E8E8] z-10">
              <div className="flex items-center justify-between px-6 py-5">
                <div className="flex items-center gap-3">
                  <GitCompareArrows className="w-5 h-5" strokeWidth={1.5} />
                  <div>
                    <h2 className="text-[16px] font-medium">Compare Products</h2>
                    <p className="text-[12px] text-[#999] mt-0.5">{compareItems.length} of 4 products</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {compareItems.length > 0 && (
                    <button suppressHydrationWarning
                      onClick={clearCompare}
                      className="text-[12px] text-[#999] hover:text-[#C53030] transition-colors tracking-wide uppercase flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Clear All
                    </button>
                  )}
                  <button suppressHydrationWarning onClick={() => setCompareOpen(false)} className="w-10 h-10 flex items-center justify-center hover:bg-[#F0EFED] transition-colors">
                    <X className="w-5 h-5" strokeWidth={1.5} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6">
              {/* Key forces remount when items change */}
              <CompareContent key={compareItems.join(",")} ids={compareItems} />
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}