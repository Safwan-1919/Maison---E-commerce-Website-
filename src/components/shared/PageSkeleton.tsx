"use client";

import { motion } from "framer-motion";

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.05,
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  }),
};

export function PageSkeleton() {
  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-[#F8F8F6]">
      {/* Breadcrumb skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="flex items-center gap-2 mb-8"
      >
        <div className="h-3 w-12 bg-[#E8E8E8] rounded animate-[skeleton-pulse_2s_ease-in-out_infinite]" />
        <div className="h-3 w-4 bg-[#E8E8E8] rounded animate-[skeleton-pulse_2s_ease-in-out_infinite_0.1s]" />
        <div className="h-3 w-16 bg-[#E8E8E8] rounded animate-[skeleton-pulse_2s_ease-in-out_infinite_0.2s]" />
      </motion.div>

      {/* Title skeleton */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="h-8 w-48 bg-[#E8E8E8] rounded mb-8 animate-[skeleton-pulse_2s_ease-in-out_infinite]"
      />

      {/* Grid skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <motion.div
            key={i}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            <div className="aspect-[3/4] bg-[#E8E8E8] rounded animate-[skeleton-pulse_2s_ease-in-out_infinite]" />
            <div className="h-3 w-3/4 bg-[#E8E8E8] rounded animate-[skeleton-pulse_2s_ease-in-out_infinite]" />
            <div className="h-3 w-1/2 bg-[#E8E8E8] rounded animate-[skeleton-pulse_2s_ease-in-out_infinite]" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}