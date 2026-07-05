"use client";

import { useEffect, useState } from "react";

/*
 * MAISON Preloader
 *
 * A cinematic, luxury-grade loading experience.
 * Total duration: ~2.2s
 *
 * Scene 1: Overlay covers viewport (instant)
 * Scene 2: Text enters — opacity, translateY, blur, scale (800ms)
 * Scene 3: Text breathes / micro hold (400ms)
 * Scene 4: Text scales + fades, clip-path reveals page (1000ms)
 * Scene 5: Component unmounts
 */

type Phase = "enter" | "breathe" | "reveal" | "done";

export function LoadingScreen() {
  const [phase, setPhase] = useState<Phase>("enter");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("breathe"), 800);
    const t2 = setTimeout(() => setPhase("reveal"), 1200);
    const t3 = setTimeout(() => setPhase("done"), 2200);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, []);

  if (phase === "done") return null;

  const isEnter = phase === "enter";
  const isBreathe = phase === "breathe";
  const isReveal = phase === "reveal";

  return (
    <div
      className="fixed inset-0 z-[200]"
      role="status"
      aria-label="Loading"
      aria-live="polite"
    >
      {/* ── Film Grain Layer ────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          animation: "grainShift 0.4s steps(3) infinite",
        }}
      />

      {/* ── Vignette Layer ─────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.4) 100%)",
        }}
      />

      {/* ── Subtle Light Variation ─────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.02]"
        style={{
          background:
            "radial-gradient(ellipse at 30% 50%, rgba(255,255,255,0.08) 0%, transparent 60%)",
          animation: "lightShift 4s ease-in-out infinite alternate",
        }}
      />

      {/* ── Main Overlay + Text ────────────────────────── */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backgroundColor: "#0E0E0E",
          clipPath: isReveal
            ? "polygon(0 0, 100% 0, 100% 0, 0 0)"
            : "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
          transition:
            "clip-path 1s cubic-bezier(0.77, 0, 0.175, 1) 0.05s",
        }}
      >
        {/* MAISON Typography */}
        <span
          className="select-none"
          style={{
            fontFamily:
              "'Helvetica Neue', 'Arial', 'Inter', -apple-system, sans-serif",
            fontSize: "clamp(40px, 10vw, 96px)",
            fontWeight: 500,
            letterSpacing: "clamp(0.14em, 2vw, 0.22em)",
            color: "#F8F8F8",
            textTransform: "uppercase",
            lineHeight: 1,

            /* Scene 2: Enter */
            opacity: isEnter ? 0 : isReveal ? 0 : 1,
            transform: isEnter
              ? "translateY(28px) scale(0.97)"
              : isReveal
                ? "translateY(0) scale(1.06)"
                : "translateY(0) scale(1)",
            filter: isEnter ? "blur(6px)" : "blur(0px)",

            /* Scene 3: Breathe — subtle pulse */
            animation: isBreathe ? "textBreathe 2.5s ease-in-out infinite" : "none",

            transition: isReveal
              ? "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)"
              : "opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s cubic-bezier(0.16, 1, 0.3, 1)",
          }}
        >
          Maison
        </span>

        {/* Thin accent line below text */}
        <div
          className="absolute"
          style={{
            bottom: "calc(50% - clamp(28px, 6vw, 54px))",
            left: "50%",
            transform: "translateX(-50%)",
            width: "clamp(40px, 6vw, 72px)",
            height: "1px",
            backgroundColor: "rgba(248, 248, 248, 0.12)",
            opacity: isEnter ? 0 : isReveal ? 0 : 1,
            transition:
              "opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.3s",
          }}
        />
      </div>

      {/* ── Keyframes ──────────────────────────────────── */}
      <style>{`
        @keyframes grainShift {
          0% { transform: translate(0, 0); }
          33% { transform: translate(-2px, 1px); }
          66% { transform: translate(1px, -1px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes lightShift {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(3%, -2%) scale(1.05); }
        }
        @keyframes textBreathe {
          0% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-2px) scale(1.008); }
          100% { transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
