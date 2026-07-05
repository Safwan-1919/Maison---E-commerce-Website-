"use client";

import { useEffect, useRef } from "react";

export function LoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const dpr = window.devicePixelRatio || 1;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.scale(dpr, dpr);

    const GRAVITY = 0.65;
    const BOUNCE = -0.78;
    const FRICTION = 0.99;
    const BALL_R = Math.max(14, Math.min(22, w * 0.018));
    const GROUND = h - 80;

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
      maxLife: number;
      r: number;
      color: string;
    }

    interface Ball {
      x: number;
      y: number;
      vy: number;
      vx: number;
      r: number;
      squash: number;
      squashV: number;
      hue: number;
      particles: Particle[];
      trail: { x: number; y: number; life: number }[];
      bounced: boolean;
    }

    const colors = ["#4D5B47", "#6B7F5E", "#3A4A35", "#8FA880", "#2C3A28"];
    const balls: Ball[] = [];
    const count = Math.min(5, Math.max(3, Math.floor(w / 250)));

    for (let i = 0; i < count; i++) {
      balls.push({
        x: w * (0.2 + 0.6 * (i / (count - 1 || 1))),
        y: -60 - i * 120,
        vy: 0,
        vx: (Math.random() - 0.5) * 2.5,
        r: BALL_R - i * 1.5,
        squash: 1,
        squashV: 0,
        hue: 0,
        particles: [],
        trail: [],
        bounced: false,
      });
    }

    let opacity = 1;
    let fadeOut = false;
    let startTime = performance.now();

    const spawnParticles = (ball: Ball, count: number) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 0.5;
        ball.particles.push({
          x: ball.x,
          y: GROUND,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 2,
          life: 1,
          maxLife: 0.4 + Math.random() * 0.4,
          r: 1.5 + Math.random() * 2.5,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
    };

    const drawBall = (ball: Ball) => {
      ctx.save();
      ctx.translate(ball.x, ball.y);

      const sx = 1 + (1 - ball.squash) * 0.4;
      const sy = ball.squash;
      ctx.scale(sx, sy);

      const gradient = ctx.createRadialGradient(
        -ball.r * 0.25,
        -ball.r * 0.3,
        ball.r * 0.1,
        0,
        0,
        ball.r
      );
      gradient.addColorStop(0, "#8FA880");
      gradient.addColorStop(0.5, "#4D5B47");
      gradient.addColorStop(1, "#2C3A28");

      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      ctx.globalAlpha = opacity * 0.4;
      ctx.beginPath();
      ctx.ellipse(
        -ball.r * 0.2,
        -ball.r * 0.25,
        ball.r * 0.35,
        ball.r * 0.2,
        -0.5,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fill();

      ctx.restore();
    };

    const drawShadow = (ball: Ball) => {
      const dist = Math.max(0, (GROUND - ball.y) / (GROUND + 100));
      const scaleX = 1 - dist * 0.5;
      const alpha = (1 - dist) * 0.15 * opacity;

      ctx.save();
      ctx.translate(ball.x, GROUND + 4);
      ctx.scale(scaleX, 0.2);
      ctx.beginPath();
      ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fill();
      ctx.restore();
    };

    const drawTrails = (ball: Ball) => {
      for (let i = 0; i < ball.trail.length; i++) {
        const t = ball.trail[i];
        const alpha = t.life * 0.2 * opacity;
        const size = ball.r * t.life * 0.6;
        ctx.beginPath();
        ctx.arc(t.x, t.y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(77,91,71,${alpha})`;
        ctx.fill();
      }
    };

    const animate = () => {
      const now = performance.now();
      const elapsed = (now - startTime) / 1000;

      if (elapsed > 2.8 && !fadeOut) fadeOut = true;

      ctx.clearRect(0, 0, w, h);

      if (fadeOut) {
        opacity = Math.max(0, opacity - 0.035);
      }

      for (const ball of balls) {
        ball.vy += GRAVITY;
        ball.y += ball.vy;
        ball.x += ball.vx;
        ball.vx *= FRICTION;

        ball.squashV += (1 - ball.squash) * 0.25;
        ball.squashV *= 0.7;
        ball.squash += ball.squashV;

        if (ball.x < -50) ball.x = w + 50;
        if (ball.x > w + 50) ball.x = -50;

        if (ball.y + ball.r > GROUND) {
          ball.y = GROUND - ball.r;
          const impact = Math.abs(ball.vy);
          ball.vy *= BOUNCE;
          ball.squash = 0.6 + Math.min(impact * 0.02, 0.3);
          ball.squashV = 0;

          if (impact > 2) {
            spawnParticles(ball, Math.min(12, Math.floor(impact * 1.2)));
          }
          ball.bounced = true;
        }

        if (!ball.bounced || Math.abs(ball.vy) > 0.5) {
          ball.trail.push({ x: ball.x, y: ball.y, life: 1 });
        }
        for (let i = ball.trail.length - 1; i >= 0; i--) {
          ball.trail[i].life -= 0.04;
          if (ball.trail[i].life <= 0) ball.trail.splice(i, 1);
        }

        for (let i = ball.particles.length - 1; i >= 0; i--) {
          const p = ball.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12;
          p.life -= 1 / (60 * p.maxLife);
          if (p.life <= 0) ball.particles.splice(i, 1);
        }

        drawTrails(ball);
        drawShadow(ball);
        drawBall(ball);

        for (const p of ball.particles) {
          ctx.globalAlpha = p.life * opacity;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
        ctx.globalAlpha = 1;
      }

      ctx.globalAlpha = opacity;
      ctx.fillStyle = "#111";
      ctx.font = `300 ${Math.max(18, Math.min(28, w * 0.022))}px Inter, sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText("M A I S O N", w / 2, GROUND + 50);
      ctx.globalAlpha = 1;

      if (opacity <= 0) {
        cancelAnimationFrame(frameRef.current);
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
