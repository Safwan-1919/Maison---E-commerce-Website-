"use client";

import { useEffect, useRef } from "react";

export function LoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const dpr = window.devicePixelRatio || 1;
    let w = window.innerWidth;
    let h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    const GRAVITY = 0.45;
    const BALL_R = Math.max(16, Math.min(24, w * 0.02));
    const GROUND = h * 0.72;
    const startX = w * 0.3;
    const endX = w * 0.7;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      r: number;
      color: string;
      glow: number;
    }

    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      len: number;
      angle: number;
      color: string;
    }

    const particles: Particle[] = [];
    const sparks: Spark[] = [];
    const trail: { x: number; y: number; life: number; r: number }[] = [];

    const COLORS = ["#4D5B47", "#6B7F5E", "#8FA880", "#A8C49A", "#3A4A35", "#2C3A28"];

    let ball = {
      x: startX,
      y: -BALL_R,
      vy: 0,
      vx: 0,
      r: BALL_R,
      squash: 1,
      squashV: 0,
      phase: "drop" as "drop" | "roll" | "blast" | "fade",
      bounceCount: 0,
      rollProgress: 0,
      blastTimer: 0,
      rotation: 0,
      opacity: 1,
    };

    let startTime = performance.now();
    let fadeOut = false;

    const spawnBlastParticles = (x: number, y: number) => {
      for (let i = 0; i < 60; i++) {
        const angle = (Math.PI * 2 * i) / 60 + (Math.random() - 0.5) * 0.3;
        const speed = 2 + Math.random() * 8;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 3,
          life: 1,
          maxLife: 0.6 + Math.random() * 0.8,
          r: 2 + Math.random() * 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
          glow: Math.random() > 0.5 ? 1 : 0,
        });
      }
      for (let i = 0; i < 30; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 4 + Math.random() * 10;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          len: 8 + Math.random() * 20,
          angle,
          color: COLORS[Math.floor(Math.random() * 3)],
        });
      }
    };

    const drawBall = (b: typeof ball) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rotation);

      const sx = 1 + (1 - b.squash) * 0.5;
      const sy = b.squash;
      ctx.scale(sx, sy);
      ctx.globalAlpha = b.opacity;

      const grad = ctx.createRadialGradient(-b.r * 0.3, -b.r * 0.3, b.r * 0.05, 0, 0, b.r);
      grad.addColorStop(0, "#A8C49A");
      grad.addColorStop(0.4, "#6B7F5E");
      grad.addColorStop(0.8, "#4D5B47");
      grad.addColorStop(1, "#2C3A28");

      ctx.shadowColor = "rgba(77,91,71,0.35)";
      ctx.shadowBlur = 20;
      ctx.shadowOffsetY = 6;

      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;

      ctx.globalAlpha = b.opacity * 0.55;
      ctx.beginPath();
      ctx.ellipse(-b.r * 0.25, -b.r * 0.3, b.r * 0.3, b.r * 0.18, -0.6, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fill();

      ctx.globalAlpha = b.opacity * 0.2;
      ctx.beginPath();
      ctx.arc(0, 0, b.r + 3, 0, Math.PI * 2);
      ctx.strokeStyle = "#4D5B47";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.restore();
    };

    const drawShadow = (b: typeof ball) => {
      const dist = Math.max(0, (GROUND - b.y) / (GROUND + 100));
      const scaleX = (1 - dist * 0.6) * (1 + (1 - b.squash) * 0.3);
      const alpha = (1 - dist) * 0.18 * b.opacity;

      ctx.save();
      ctx.translate(b.x, GROUND + 3);
      ctx.scale(scaleX, 0.15);
      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      const now = performance.now();
      const dt = Math.min((now - startTime) / 1000, 0.05);
      startTime = now;

      ctx.clearRect(0, 0, w, h);

      if (fadeOut) {
        ball.opacity = Math.max(0, ball.opacity - 0.04);
      }

      if (ball.phase === "drop") {
        ball.vy += GRAVITY;
        ball.y += ball.vy;
        ball.rotation += ball.vy * 0.003;

        if (ball.y + ball.r > GROUND) {
          ball.y = GROUND - ball.r;
          const impact = Math.abs(ball.vy);
          ball.vy *= -0.72;
          ball.squash = 0.65 + Math.min(impact * 0.015, 0.25);
          ball.squashV = 0;
          ball.bounceCount++;

          if (ball.bounceCount >= 2) {
            ball.phase = "roll";
            ball.vx = 0;
            ball.vy = 0;
          }
        }

        ball.squashV += (1 - ball.squash) * 0.22;
        ball.squashV *= 0.72;
        ball.squash += ball.squashV;

        if (Math.abs(ball.vy) > 0.3) {
          trail.push({ x: ball.x, y: ball.y, life: 1, r: ball.r * 0.4 });
        }
      } else if (ball.phase === "roll") {
        ball.rollProgress += 0.012;
        ball.x = startX + (endX - startX) * Math.min(ball.rollProgress, 1);
        ball.y = GROUND - ball.r;
        ball.rotation += 0.12;
        ball.squash = 0.88 + Math.sin(ball.rollProgress * 20) * 0.04;
        ball.squashV = 0;

        if (ball.rollProgress >= 1) {
          ball.phase = "blast";
          ball.blastTimer = 0;
          spawnBlastParticles(ball.x, ball.y);
        }

        trail.push({ x: ball.x, y: ball.y + ball.r * 0.3, life: 1, r: ball.r * 0.25 });
      } else if (ball.phase === "blast") {
        ball.blastTimer += dt;
        ball.r *= 0.88;
        ball.opacity *= 0.9;
        ball.squash = 0.5 + Math.random() * 1;
        ball.squashV = 0;

        if (ball.blastTimer > 0.15) {
          ball.opacity = 0;
        }

        if (ball.opacity <= 0 && particles.length === 0 && sparks.length === 0) {
          fadeOut = false;
          ball.phase = "fade";
        }
      } else if (ball.phase === "fade") {
        ball.opacity = 0;
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= 0.03;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1;
        p.vx *= 0.99;
        p.life -= dt / p.maxLife;
        if (p.life <= 0) particles.splice(i, 1);
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.08;
        s.vx *= 0.98;
        s.life -= dt * 1.8;
        if (s.life <= 0) sparks.splice(i, 1);
      }

      for (const t of trail) {
        ctx.globalAlpha = t.life * 0.3 * ball.opacity;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r * t.life, 0, Math.PI * 2);
        ctx.fillStyle = "#4D5B47";
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawShadow(ball);

      if (ball.phase !== "fade") {
        drawBall(ball);
      }

      for (const p of particles) {
        ctx.globalAlpha = p.life * ball.opacity;
        if (p.glow) {
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 8;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.shadowColor = "transparent";
        ctx.shadowBlur = 0;
      }

      for (const s of sparks) {
        ctx.globalAlpha = s.life * ball.opacity;
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s.len * s.life, 0);
        ctx.strokeStyle = s.color;
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = 1;

      const elapsed = (now - startTime) / 1000;
      if (!fadeOut && ball.phase === "fade" && particles.length === 0) {
        fadeOut = true;
      }

      if (ball.opacity <= 0 && ball.phase === "fade") {
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    const onResize = () => {
      w = canvas.width / dpr;
      h = canvas.height / dpr;
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] bg-[#F8F8F6]"
      style={{ pointerEvents: "none" }}
    />
  );
}
