"use client";

import { useEffect, useState, useRef } from "react";

const WORDS = ["We", "Make", "Good", "Shit"];

export function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<"count" | "text" | "split" | "done">("count");
  const [visibleWords, setVisibleWords] = useState(0);
  const startRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const duration = 2000;

    const tick = () => {
      const elapsed = performance.now() - startRef.current;
      const raw = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - raw, 3);
      setProgress(Math.floor(eased * 100));

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setProgress(100);
        setPhase("text");
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (phase !== "text") return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleWords(i);
      if (i >= WORDS.length) {
        clearInterval(interval);
        setTimeout(() => setPhase("split"), 600);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "split") return;
    const t = setTimeout(() => setPhase("done"), 1400);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  return (
    <div className="fixed inset-0 z-[200] overflow-hidden">
      {/* Top half */}
      <div
        className="absolute inset-0 bg-[#111] origin-top"
        style={{
          transform: phase === "split" ? "scaleY(0)" : "scaleY(1)",
          transition: "transform 1s cubic-bezier(0.76, 0, 0.24, 1)",
        }}
      />

      {/* Bottom half */}
      <div
        className="absolute inset-0 bg-[#1a1a1a] origin-bottom"
        style={{
          transform: phase === "split" ? "scaleY(0)" : "scaleY(1)",
          transition: "transform 1s cubic-bezier(0.76, 0, 0.24, 1) 0.08s",
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {/* Counter */}
        <div
          className="transition-opacity duration-300"
          style={{ opacity: phase === "count" ? 1 : 0 }}
        >
          <span className="text-[80px] sm:text-[100px] md:text-[120px] font-light text-[#F8F8F6] tracking-[-0.04em] tabular-nums leading-none select-none">
            {String(progress).padStart(3, "\u2007")}
          </span>
          <span className="text-[20px] sm:text-[24px] md:text-[28px] font-light text-[#F8F8F6]/30 ml-1">%</span>
        </div>

        {/* Words reveal */}
        {phase === "text" && (
          <div className="flex items-center gap-3 sm:gap-4">
            {WORDS.map((word, i) => (
              <span
                key={i}
                className="text-[28px] sm:text-[36px] md:text-[48px] font-medium text-[#F8F8F6] tracking-[-0.02em] uppercase"
                style={{
                  opacity: i < visibleWords ? 1 : 0,
                  transform: i < visibleWords ? "translateY(0)" : "translateY(20px)",
                  transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
              >
                {word}
              </span>
            ))}
          </div>
        )}

        {/* Thin line */}
        <div
          className="mt-6 sm:mt-8 h-[1px] bg-[#F8F8F6]/10 transition-opacity duration-300"
          style={{
            width: "80px",
            opacity: phase === "split" ? 0 : 1,
            transform: `scaleX(${progress / 100})`,
            transformOrigin: "left",
          }}
        />
      </div>

      {/* Corner marks */}
      <div
        className="absolute top-6 left-6 sm:top-8 sm:left-8 transition-opacity duration-300"
        style={{ opacity: phase === "split" ? 0 : 0.15 }}
      >
        <div className="w-[24px] h-[1px] bg-[#F8F8F6] mb-[4px]" />
        <div className="w-[1px] h-[24px] bg-[#F8F8F6]" />
      </div>
      <div
        className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 transition-opacity duration-300"
        style={{ opacity: phase === "split" ? 0 : 0.15 }}
      >
        <div className="w-[1px] h-[24px] bg-[#F8F8F6] ml-auto mb-[4px]" />
        <div className="w-[24px] h-[1px] bg-[#F8F8F6] ml-auto" />
      </div>
    </div>
  );
}
