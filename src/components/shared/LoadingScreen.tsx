"use client";

import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [phase, setPhase] = useState<"enter" | "hold" | "reveal" | "done">("enter");

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setPhase("hold"), 300));
    timers.push(setTimeout(() => setPhase("reveal"), 1200));
    timers.push(setTimeout(() => setPhase("done"), 2400));
    return () => timers.forEach(clearTimeout);
  }, []);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[200]" aria-hidden="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-[#111]"
        style={{
          clipPath: phase === "reveal"
            ? "polygon(0 0, 100% 0, 100% 0, 0 0)"
            : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          transition: "clip-path 1.1s cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="text-[36px] sm:text-[48px] md:text-[60px] lg:text-[72px] font-medium text-[#F8F8F6] tracking-[0.18em] uppercase select-none"
          style={{
            opacity: phase === "enter" ? 1 : phase === "hold" ? 1 : 0,
            transform: phase === "enter"
              ? "translateY(30px) scale(1)"
              : phase === "hold"
                ? "translateY(0) scale(1)"
                : "translateY(0) scale(1.08)",
            filter: phase === "enter" ? "blur(8px)" : "blur(0px)",
            transition: "all 0.7s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          Maison
        </span>
      </div>
    </div>
  );
}
