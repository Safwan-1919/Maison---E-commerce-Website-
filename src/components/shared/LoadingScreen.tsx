"use client";

import { useEffect, useRef, useState } from "react";

export function LoadingScreen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef<number>(0);
  const [visible, setVisible] = useState(true);

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

    const BALL_R = Math.max(16, Math.min(22, w * 0.018));
    const GROUND = h * 0.65;
    const startX = w * 0.1;
    const totalDist = w * 0.8;
    const bounceCount = w > 768 ? 4 : 3;
    const bounceHeight = h * 0.28;

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      life: number; maxLife: number; r: number; color: string;
    }
    interface Spark {
      x: number; y: number; vx: number; vy: number;
      life: number; len: number; angle: number;
    }

    const particles: Particle[] = [];
    const sparks: Spark[] = [];
    const trail: { x: number; y: number; life: number; r: number }[] = [];
    const COLORS = ["#1a1a1a", "#333", "#555", "#777", "#222", "#000"];

    let ball = {
      x: startX, y: GROUND - BALL_R,
      vx: 0, vy: 0, r: BALL_R,
      squash: 1, squashV: 0,
      rotation: 0, opacity: 1,
      bounceNum: 0, airTime: 0,
      launched: false,
    };

    let lastTime = performance.now();
    let elapsed = 0;
    let done = false;
    let fadeTimer = 0;

    const launchBall = () => {
      ball.launched = true;
      ball.airTime = 0;
      const segDist = totalDist / bounceCount;
      const segTime = 0.38;
      ball.vx = segDist / (segTime * 60);
      ball.vy = -Math.sqrt(2 * 0.6 * bounceHeight);
    };

    const spawnBlast = (x: number, y: number) => {
      for (let i = 0; i < 80; i++) {
        const angle = (Math.PI * 2 * i) / 80 + (Math.random() - 0.5) * 0.6;
        const speed = 1.5 + Math.random() * 9;
        particles.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - Math.random() * 4,
          life: 1,
          maxLife: 0.6 + Math.random() * 1.2,
          r: 2 + Math.random() * 5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 5 + Math.random() * 14;
        sparks.push({
          x, y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1,
          len: 15 + Math.random() * 35,
          angle,
        });
      }
    };

    const drawBall = () => {
      ctx.save();
      ctx.translate(ball.x, ball.y);
      ctx.rotate(ball.rotation);
      ctx.scale(1 + (1 - ball.squash) * 0.4, ball.squash);
      ctx.globalAlpha = ball.opacity;

      const grad = ctx.createRadialGradient(-ball.r * 0.3, -ball.r * 0.35, ball.r * 0.05, 0, 0, ball.r);
      grad.addColorStop(0, "#555");
      grad.addColorStop(0.3, "#333");
      grad.addColorStop(0.7, "#111");
      grad.addColorStop(1, "#000");

      ctx.shadowColor = "rgba(0,0,0,0.4)";
      ctx.shadowBlur = 25;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 8;

      ctx.beginPath();
      ctx.arc(0, 0, ball.r, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      ctx.shadowColor = "transparent";
      ctx.shadowBlur = 0;

      ctx.globalAlpha = ball.opacity * 0.45;
      ctx.beginPath();
      ctx.ellipse(-ball.r * 0.22, -ball.r * 0.28, ball.r * 0.26, ball.r * 0.14, -0.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fill();

      ctx.restore();
    };

    const drawShadow = () => {
      const onGround = ball.y >= GROUND - ball.r - 1;
      const dist = Math.max(0, (GROUND - ball.y) / bounceHeight);
      const scaleX = onGround ? (1 + (1 - ball.squash) * 0.3) : (1 - dist * 0.4);
      const alpha = onGround ? (0.2 * ball.opacity) : ((1 - dist) * 0.15 * ball.opacity);

      ctx.save();
      ctx.translate(ball.x, GROUND + 3);
      ctx.scale(scaleX, 0.1);
      ctx.beginPath();
      ctx.arc(0, 0, ball.r + 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,0,0,${alpha})`;
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      if (done) return;
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.04);
      lastTime = now;
      elapsed += dt;

      ctx.clearRect(0, 0, w, h);

      if (!ball.launched) {
        if (elapsed > 0.5) launchBall();
      } else {
        ball.vy += 0.6;
        ball.x += ball.vx;
        ball.y += ball.vy;
        ball.rotation += ball.vx * 0.008;

        const squashTarget = ball.y >= GROUND - ball.r - 1 ? 0.7 + Math.min(Math.abs(ball.vy) * 0.01, 0.25) : 1;
        ball.squashV += (squashTarget - ball.squash) * 0.2;
        ball.squashV *= 0.7;
        ball.squash += ball.squashV;

        if (ball.y + ball.r > GROUND) {
          ball.y = GROUND - ball.r;
          const impact = Math.abs(ball.vy);
          ball.vy = -Math.sqrt(2 * 0.6 * bounceHeight) * Math.pow(0.65, ball.bounceNum);
          ball.squash = 0.55 + Math.min(impact * 0.015, 0.3);
          ball.squashV = 0;
          ball.bounceNum++;

          if (impact > 1.5) {
            for (let i = 0; i < 6; i++) {
              const a = Math.random() * Math.PI;
              const sp = 1 + Math.random() * 2.5;
              trail.push({
                x: ball.x + (Math.random() - 0.5) * ball.r,
                y: GROUND,
                life: 1, r: 1.5 + Math.random() * 2,
              });
            }
          }

          if (ball.bounceNum >= bounceCount) {
            ball.vx = 0;
            ball.vy = 0;
            spawnBlast(ball.x, ball.y);
            done = true;
            fadeTimer = 0;
          }
        }

        if (Math.abs(ball.vy) > 1 || Math.abs(ball.vx) > 0.5) {
          trail.push({ x: ball.x, y: ball.y, life: 1, r: ball.r * 0.3 });
        }
      }

      if (done) {
        fadeTimer += dt;
        ball.opacity = Math.max(0, 1 - fadeTimer * 2);

        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx; p.y += p.vy; p.vy += 0.1;
          p.vx *= 0.995; p.life -= dt / p.maxLife;
          if (p.life <= 0) particles.splice(i, 1);
        }
        for (let i = sparks.length - 1; i >= 0; i--) {
          const s = sparks[i];
          s.x += s.vx; s.y += s.vy; s.vy += 0.08;
          s.vx *= 0.98; s.life -= dt * 1.5;
          if (s.life <= 0) sparks.splice(i, 1);
        }

        if (fadeTimer > 1.2) {
          setVisible(false);
          return;
        }
      }

      for (let i = trail.length - 1; i >= 0; i--) {
        trail[i].life -= dt * 3;
        if (trail[i].life <= 0) trail.splice(i, 1);
      }

      for (const t of trail) {
        ctx.globalAlpha = t.life * 0.2 * (done ? ball.opacity : 1);
        ctx.beginPath();
        ctx.arc(t.x, t.y, t.r * t.life, 0, Math.PI * 2);
        ctx.fillStyle = "#222";
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      drawShadow();
      if (ball.opacity > 0) drawBall();

      for (const p of particles) {
        ctx.globalAlpha = p.life * Math.max(ball.opacity, 0.2);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * Math.max(p.life, 0.05), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      }
      for (const s of sparks) {
        ctx.globalAlpha = s.life * Math.max(ball.opacity, 0.2);
        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(s.len * s.life, 0);
        ctx.strokeStyle = "#111";
        ctx.lineWidth = 1.5;
        ctx.lineCap = "round";
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(frameRef.current); done = true; };
  }, []);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-[200] bg-[#F8F8F6]"
      style={{ pointerEvents: "none", transition: "opacity 0.5s ease", opacity: visible ? 1 : 0 }}
    />
  );
}
