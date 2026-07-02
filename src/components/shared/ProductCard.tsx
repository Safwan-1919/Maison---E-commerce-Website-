"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingBag, Star, Eye, GitCompareArrows } from "lucide-react";
import { useStore } from "@/lib/store";
import Image from "next/image";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  images?: string[];
  category: string;
  brand: string;
  rating: number;
  reviewCount: number;
  discount: number;
  isNew?: boolean;
  isTrending?: boolean;
  isBestSeller?: boolean;
  index?: number;
  quickView?: boolean;
}

export function ProductCard({
  id,
  name,
  price,
  mrp,
  image,
  images,
  category,
  brand,
  rating,
  reviewCount,
  discount,
  isNew,
  isTrending,
  isBestSeller,
  index = 0,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { navigate, addToCart, toggleWishlist, isInWishlist, setQuickViewProductId, addToCompare, isInCompare, setCompareOpen } = useStore();
  const inWishlist = isInWishlist(id);
  const inCompare = isInCompare(id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: id,
      name,
      price,
      mrp,
      image,
      size: "M",
      color: "Default",
    });
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(id);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewProductId(id);
  };

  const handleCompare = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCompare(id);
  };

  const currentImage = isHovered && images && images[1] ? images[1] : image;

  return (
    <motion.div
      className="group cursor-pointer"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.5,
        delay: index * 0.06,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigate("product", id)}
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-[#F0EFED] overflow-hidden mb-3 group-hover:[box-shadow:inset_0_0_30px_rgba(0,0,0,0.08)] transition-[box-shadow] duration-500">
        {imgError ? (
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8E8E8] to-[#D1D1D1] flex items-center justify-center">
            <ShoppingBag className="w-8 h-8 text-[#999]" strokeWidth={1} />
          </div>
        ) : (
          <Image
            src={currentImage}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={() => setImgError(true)}
          />
        )}

        {/* Labels */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {isNew && (
            <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase bg-[#111] text-[#F8F8F6]">
              New
            </span>
          )}
          {discount > 0 && (
            <span className="px-2.5 py-1 text-[11px] font-medium tracking-wide uppercase bg-[#F8F8F6] text-[#111]">
              {Math.round(discount)}% Off
            </span>
          )}
        </div>

        {/* Actions - Desktop hover only */}
        <div className="absolute top-3 right-3 flex-col gap-2 max-md:hidden">
          <motion.button
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -4 }}
            transition={{ duration: 0.2 }}
            onClick={handleWishlist}
            className="w-9 h-9 bg-[#F8F8F6] flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <Heart
              className="w-4 h-4"
              fill={inWishlist ? "#111" : "none"}
              stroke="#111"
              strokeWidth={1.5}
            />
          </motion.button>
          <motion.button
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -4 }}
            transition={{ duration: 0.2, delay: 0.05 }}
            onClick={handleQuickView}
            className="w-9 h-9 bg-[#F8F8F6] flex items-center justify-center hover:bg-white transition-colors shadow-sm"
          >
            <Eye className="w-4 h-4" stroke="#111" strokeWidth={1.5} />
          </motion.button>
          <motion.button
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -4 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            onClick={handleCompare}
            className={`w-9 h-9 flex items-center justify-center transition-colors shadow-sm ${inCompare ? 'bg-[#111] text-white' : 'bg-[#F8F8F6] hover:bg-white'}`}
          >
            <GitCompareArrows className="w-4 h-4" stroke={inCompare ? '#F8F8F6' : '#111'} strokeWidth={1.5} />
          </motion.button>
        </div>

        {/* Mobile actions - always visible */}
        <div className="absolute top-3 right-3 md:hidden">
          <button
            onClick={handleWishlist}
            className="w-8 h-8 bg-[#F8F8F6]/90 backdrop-blur-sm flex items-center justify-center"
          >
            <Heart
              className="w-3.5 h-3.5"
              fill={inWishlist ? "#111" : "none"}
              stroke="#111"
              strokeWidth={1.5}
            />
          </button>
        </div>

        {/* Quick Add - Desktop hover */}
        <motion.div
          initial={false}
          animate={{ opacity: isHovered ? 1 : 0, y: isHovered ? 0 : -4 }}
          transition={{ duration: 0.25, delay: 0.05 }}
          className="absolute bottom-0 left-0 right-0 p-3 md:block hidden"
        >
          <button
            onClick={handleAddToCart}
            className="w-full py-2.5 bg-[#111] text-[#F8F8F6] text-[12px] font-medium tracking-widest uppercase hover:bg-[#333] transition-colors"
          >
            Add to Bag
          </button>
        </motion.div>
      </div>

      {/* Info */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-medium tracking-wider uppercase text-[#999]">
            {brand}
          </p>
          <div className="flex items-center gap-2">
            {isBestSeller && (
              <span className="text-[10px] font-medium tracking-wider uppercase text-[#4D5B47]">
                Best Seller
              </span>
            )}
          </div>
        </div>
        <h3 className="text-[14px] font-normal leading-tight text-[#111] line-clamp-2 min-h-[2.5em]">
          {name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[14px] font-medium text-[#111]">
            {"\u20B9"}{price.toLocaleString("en-IN")}
          </span>
          {mrp > price && (
            <span className="text-[12px] text-[#999] line-through">
              {"\u20B9"}{mrp.toLocaleString("en-IN")}
            </span>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              <Star className="w-3 h-3 fill-[#111] text-[#111]" />
              <span className="text-[12px] text-[#666]">{rating}</span>
            </div>
            <span className="text-[11px] text-[#999]">({reviewCount})</span>
          </div>
          {/* Mobile add to bag button - always visible on small screens */}
          <button
            onClick={handleAddToCart}
            className="md:hidden px-3 py-1.5 border border-[#E8E8E8] text-[10px] font-medium tracking-widest uppercase text-[#111] hover:bg-[#F0EFED] transition-colors"
          >
            Add
          </button>
        </div>
      </div>
    </motion.div>
  );
}