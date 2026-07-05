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

    const GRAVITY = 0.5;
    const BALL_R = Math.max(18, Math.min(26, w * 0.022));
    const GROUND = h * 0.6;
    const CENTER_Y = h * 0.5;
    const startX = w * 0.25;
    const endX = w * 0.75;

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

    const COLORS = ["#1a1a1a", "#333", "#555", "#777", "#222"];

    let ball = {
      x: startX,
      y: CENTER_Y,
      vy: 0,
      vx: 0,
      r: BALL_R,
      squash: 1,
      squashV: 0,
      phase: "idle" as "idle" | "drop" | "roll" | "blast" | "done",
      bounceCount: 0,
      rollProgress: 0,
      blastTimer: 0,
      rotation: 0,
      opacity: 1,
      idleTimer: 0,
    };

    let startTime = performance.now();
    let done = false;

    const spawnBlast = (x: number, y: number) => {
      for (let i = 0; i < 50; i++) {
        const angle = (Math.PI * 2 * i) / 50 + (Math.random() - 0.5) * 0.4;
        const speed = 2 + Math.random() * 7;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 2,
          life: 1,
          maxLife: 0.5 + Math.random() * 0.7,
          r: 2 + Math.random() * 4,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
      for (let i = 0; i < 24; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 10;
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          len: 10 + Math.random() * 25,
          angle,
          color: "#111",
        });
      }
    };

    const drawBall = (b: typeof ball) => {
      ctx.save();
      ctx.translate(b.x, b.y);
      ctx.rotate(b.rotation);
      ctx.scale(1 + (1 - b.squash) * 0.4, b.squash);
      ctx.globalAlpha = b.opacity;

      const grad = ctx.createRadialGradient(-b.r * 0.3, -b.r * 0.35, b.r * 0.05, 0, 0, b.r);
      grad.addColorStop(0, "#444");
      grad.addColorStop(0.35, "#222");
      grad.addColorStop(0.75, "#111");
      grad.addColorStop(1, "#000");

      ctx.shadowColor = "rgba(0,0,0,0.5)";
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 8;

      ctx.beginPath();
      ctx.arc(0, 0, b.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      ctx.globalAlpha = b.opacity * 0.5;
      ctx.beginPath();
      ctx.ellipse(-b.r * 0.25, -b.r * 0.3, b.r * 0.3, b.r * 0.16, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.fill();

      ctx.restore();
    };

    const drawShadow = (b: typeof ball) => {
      const dist = Math.max(0, (GROUND - b.y) / (GROUND + 50));
      const scaleX = (1 - dist * 0.5) * (1 + (1 - b.squash) * 0.3);
      const alpha = (1 - dist) * 0.25 * b.opacity;

      ctx.save();
      ctx.translate(b.x, GROUND + 4);
      ctx.scale(scaleX, 0.12);
      ctx.beginPath();
      ctx.arc(0, 0, b.r + 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      if (done) return;
      const now = performance.now();
      const dt = Math.min((now - startTime) / 1000, 0.04);
      startTime = now;

      ctx.clearRect(0, 0, w, h);

      if (ball.phase === "idle") {
        ball.idleTimer += dt;
        ball.y = CENTER_Y + Math.sin(ball.idleTimer * 2.5) * 3;
        if (ball.idleTimer > 0.6) {
          ball.phase = "drop";
          ball.vy = 0;
        }
      } else if (ball.phase === "drop") {
        ball.vy += GRAVITY;
        ball.y += ball.vy;
        ball.rotation += ball.vy * 0.004;

        if (ball.y + ball.r > GROUND) {
          ball.y = GROUND - ball.r;
          const impact = Math.abs(ball.vy);
          ball.vy *= -0.7;
          ball.squash = 0.6 + Math.min(impact * 0.015, 0.28);
          ball.squashV = 0;
          ball.bounceCount++;

          if (ball.bounceCount >= 2) {
            ball.phase = "roll";
            ball.vx = 0;
            ball.vy = 0;
            ball.rollProgress = 0;
          }
        }

        ball.squashV += (1 - ball.squash) * 0.2;
        ball.squashV *= 0.7;
        ball.squash += ball.squashV;

        if (Math.abs(ball.vy) > 0.5) {
          trail.push({ x: ball.x, y: ball.y, life: 1, r: ball.r * 0.35 });
        }
      } else if (ball.phase === "roll") {
        ball.rollProgress += 0.015;
        ball.x = startX + (endX - startX) * Math.min(ball.rollProgress, 1);
        ball.y = GROUND - ball.r;
        ball.rotation += 0.15;
        ball.squash = 0.85 + Math.sin(ball.rollProgress * 25) * 0.05;

        trail.push({ x: ball.x, y: ball.y + ball.r * 0.2, life: 1, r: ball.r * 0.2 });

        if (ball.rollProgress >= 1) {
          ball.phase = "blast";
          ball.blastTimer = 0;
          spawnBlast(ball.x, ball.y);
        }
      } else if (ball.phase === "blast") {
        ball.blastTimer += dt;
        ball.r *= 0.85;
        ball.opacity *= 0.88;
        ball.squash = 0.4 + Math.random() * 1.2;

        if (ball.blastTimer > 0.12) ball.opacity = 0;

        if (ball.opacity <= 0 && particles.length === 0 && sparks.length === 0) {
          ball.phase = "done";
          done = true;
          const el = document.getElementById("loading-screen");
          if (el) el.style.opacity = "0";
          setTimeout(() => { const el2 = document.getElementById("loading-screen"); if (el2) el2.remove(); }, 400);
          return;
        }
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= 0.035;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.99;
        p.life -= dt / p.maxLife;
        if (p.life <= 0) particles.splice(i, 1);
      }
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.1;
        s.vx *= 0.97;
        s.life -= dt * 2;
        if (s.life <= 0) sparks.splice(i, 1);
      }

      for (const t of trail) {
        ctx.globalAlpha = t.life * 0.25 * ball.opacity;
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r * t.life, 0, Math.PI * 2);
        ctx.fillStyle = "#111";
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawShadow(ball);

      if (ball.phase !== "done") drawBall(ball);

      for (const p of particles) {
        ctx.globalAlpha = p.life * ball.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
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
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameRef.current);
      done = true;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="loading-screen"
      className="fixed inset-0 z-[200] bg-[#F8F8F6]"
      style={{ pointerEvents: "none", transition: "opacity 0.4s ease" }}
    />
  );
}
