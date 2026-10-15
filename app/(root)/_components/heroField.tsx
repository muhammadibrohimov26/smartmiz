"use client";

import { useEffect, useRef } from "react";

// Interactive hero background (in the spirit of antigravity.google): a grid of
// short dashes that turn toward the pointer, get pushed aside and light up in
// the brand yellow near it, then ease back. Without a pointer (phones, idle)
// a slow virtual cursor drifts across so the field never looks frozen.
// Pauses off-screen / in background tabs; static for prefers-reduced-motion.

type Dot = { x: number; y: number; ox: number; oy: number; angle: number; glow: number };

const RADIUS = 210; // px of pointer influence
const PUSH = 30; // max displacement near the pointer
const YELLOW = [255, 184, 0];

export default function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let dots: Dot[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;
    let running = false;
    let visible = true;
    const pointer = { x: -9999, y: -9999, active: false, lastMove: 0 };
    let t = Math.random() * 1000;

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const gap = width < 640 ? 30 : 26;
      dots = [];
      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2; x < width; x += gap) {
          dots.push({ x, y, ox: 0, oy: 0, angle: Math.random() * Math.PI, glow: 0 });
        }
      }
    }

    function draw() {
      const dark = document.documentElement.classList.contains("dark");
      const base = dark ? [255, 255, 255] : [24, 24, 27];
      const baseAlpha = dark ? 0.17 : 0.2;
      ctx!.clearRect(0, 0, width, height);

      // Real pointer, or a slow Lissajous "ghost" cursor when idle
      const idle = !pointer.active || performance.now() - pointer.lastMove > 2500;
      const px = idle ? width * (0.5 + 0.32 * Math.sin(t * 0.00037)) : pointer.x;
      const py = idle ? height * (0.45 + 0.28 * Math.sin(t * 0.00053 + 1.3)) : pointer.y;
      // Smaller and softer when nobody is pointing (keeps the hero text readable on phones)
      const radius = width < 640 ? RADIUS * 0.75 : RADIUS;
      const strength = idle ? 0.55 : 1;

      // Calm dashes share one colour, so they go into a single path (one stroke
      // call for ~1500 dashes); only the few lit ones near the pointer are drawn
      // one by one with their own colour and width.
      ctx!.lineCap = "round";
      ctx!.beginPath();
      const lit: Dot[] = [];

      for (const d of dots) {
        const dx = d.x - px;
        const dy = d.y - py;
        const dist = Math.hypot(dx, dy);
        const k = Math.max(0, 1 - dist / radius); // 1 at the pointer → 0 at radius
        const ease = k * k * (3 - 2 * k) * strength; // smoothstep

        // Push away from the pointer, spring back otherwise
        const tx = dist > 0 ? (dx / dist) * PUSH * ease : 0;
        const ty = dist > 0 ? (dy / dist) * PUSH * ease : 0;
        d.ox += (tx - d.ox) * 0.12;
        d.oy += (ty - d.oy) * 0.12;

        // Turn toward the pointer near it; drift back to a calm angle further away
        const target = ease > 0.02 ? Math.atan2(dy, dx) : d.angle;
        let diff = target - d.angle;
        diff = Math.atan2(Math.sin(diff), Math.cos(diff));
        d.angle += diff * (0.08 + ease * 0.2);
        d.glow += (ease - d.glow) * 0.1;

        if (d.glow > 0.04) {
          lit.push(d);
          continue;
        }
        const cx = d.x + d.ox;
        const cy = d.y + d.oy;
        const len = 3 + d.glow * 9;
        ctx!.moveTo(cx - Math.cos(d.angle) * len, cy - Math.sin(d.angle) * len);
        ctx!.lineTo(cx + Math.cos(d.angle) * len, cy + Math.sin(d.angle) * len);
      }
      ctx!.strokeStyle = `rgba(${base[0]},${base[1]},${base[2]},${baseAlpha})`;
      ctx!.lineWidth = 1.6;
      ctx!.stroke();

      for (const d of lit) {
        const cx = d.x + d.ox;
        const cy = d.y + d.oy;
        const len = 3 + d.glow * 9;
        const alpha = baseAlpha + d.glow * (dark ? 0.85 : 0.9);
        ctx!.strokeStyle = `rgba(${YELLOW[0]},${YELLOW[1]},${YELLOW[2]},${alpha})`;
        ctx!.lineWidth = 1.6 + d.glow * 1.2;
        ctx!.beginPath();
        ctx!.moveTo(cx - Math.cos(d.angle) * len, cy - Math.sin(d.angle) * len);
        ctx!.lineTo(cx + Math.cos(d.angle) * len, cy + Math.sin(d.angle) * len);
        ctx!.stroke();
      }
    }

    function loop(now: number) {
      t = now;
      draw();
      frame = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reduceMotion || !visible || document.hidden) return;
      running = true;
      frame = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function onPointer(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.x >= -RADIUS && pointer.x <= width + RADIUS && pointer.y >= -RADIUS && pointer.y <= height + RADIUS;
      pointer.lastMove = performance.now();
    }
    function onLeave() {
      pointer.active = false;
    }
    const onVisibility = () => (document.hidden ? stop() : start());

    build();
    draw();
    start();

    const resize = new ResizeObserver(() => {
      build();
      if (!running) draw();
    });
    resize.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    // Redraw static frame when the theme class changes (reduced-motion users)
    const theme = new MutationObserver(() => !running && draw());
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      resize.disconnect();
      io.disconnect();
      theme.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("pointerdown", onPointer);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[100svh] w-full [mask-image:radial-gradient(ellipse_75%_70%_at_50%_42%,black_35%,transparent_80%)]"
    />
  );
}
