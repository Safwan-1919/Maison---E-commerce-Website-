"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"counting" | "reveal" | "done">("counting");
  const rafRef = useRef<number>(0);
  const startRef = useRef<number>(0);
  const duration = 2200;

  useEffect(() => {
    startRef.current = performance.now();

    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const raw = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 4);
      const value = Math.floor(eased * 100);
      setProgress(value);

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setTimeout(() => setPhase("reveal"), 200);
        setTimeout(() => setPhase("done"), 1400);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Main overlay */}
      <motion.div
        className="absolute inset-0 bg-[#111]"
        animate={
          phase === "reveal"
            ? { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }
            : {}
        }
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      />

      {/* Bottom curtain */}
      <motion.div
        className="absolute inset-0 bg-[#1a1a1a]"
        animate={
          phase === "reveal"
            ? { clipPath: "polygon(0 100%, 100% 100%, 100% 100%, 0 100%)" }
            : {}
        }
        transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1], delay: 0.15 }}
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      />

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Percentage */}
        <motion.div
          className="relative"
          animate={phase === "reveal" ? { opacity: 0, scale: 0.9 } : {}}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <span className="text-[72px] sm:text-[96px] md:text-[120px] font-light text-[#F8F8F6] tracking-[-0.04em] tabular-nums leading-none select-none">
            {String(progress).padStart(3, "\u2007")}
          </span>
          <span className="absolute top-2 sm:top-3 md:top-4 right-[-20px] sm:right-[-28px] text-[18px] sm:text-[22px] md:text-[28px] font-light text-[#F8F8F6]/40">
            %
          </span>
        </motion.div>

        {/* Thin line */}
        <motion.div
          className="mt-6 sm:mt-8 h-[1px] bg-[#F8F8F6]/20 origin-left"
          animate={phase === "reveal" ? { scaleX: 0, opacity: 0 } : {}}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{ width: "120px", transform: `scaleX(${progress / 100})` }}
        />

        {/* Subtle label */}
        <motion.p
          className="mt-4 sm:mt-5 text-[10px] sm:text-[11px] tracking-[0.3em] uppercase text-[#F8F8F6]/30 font-medium"
          animate={phase === "reveal" ? { opacity: 0, y: 6 } : {}}
          transition={{ duration: 0.3 }}
        >
          Loading
        </motion.p>
      </div>

      {/* Corner accents */}
      <motion.div
        className="absolute top-6 left-6 sm:top-8 sm:left-8"
        animate={phase === "reveal" ? { opacity: 0 } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="w-[30px] h-[1px] bg-[#F8F8F6]/15 mb-[5px]" />
        <div className="w-[1px] h-[30px] bg-[#F8F8F6]/15" />
      </motion.div>
      <motion.div
        className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8"
        animate={phase === "reveal" ? { opacity: 0 } : {}}
        transition={{ duration: 0.3 }}
      >
        <div className="w-[1px] h-[30px] bg-[#F8F8F6]/15 ml-auto mb-[5px]" />
        <div className="w-[30px] h-[1px] bg-[#F8F8F6]/15 ml-auto" />
      </motion.div>
    </div>
  );
}
