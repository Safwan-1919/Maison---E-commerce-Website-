"use client";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-[#F8F8F6]">
      <div className="flex flex-col items-center gap-8">
        <h1 className="text-[32px] sm:text-[42px] font-light tracking-[0.2em] text-[#111] uppercase">
          Maison
        </h1>
        <div className="flex items-end gap-[6px] h-8">
          {[0, 1, 2, 3, 4].map((i) => (
            <motion.div
              key={i}
              className="w-[5px] h-[5px] rounded-full bg-[#4D5B47]"
              animate={{
                y: [0, -18, 0],
                scale: [1, 1.3, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.12,
                ease: [0.45, 0, 0.55, 1],
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
