"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Home-page background in the style of antigravity.google's particle field.
// Only on the home page ("/"); a lighter version on phones and tablets.
//
// A fixed, full-viewport canvas covered evenly with particles. Far away they
// are tiny grey specks. Inside a large circle around the pointer they become
// short rounded dashes pointing away from it, denser and brighter towards the
// rim, so the circle reads as a glowing ring. The colour turns with the angle
// around the centre — blue on the left → violet → pink on the right — and
// rings of light keep rolling outward. The field sways slowly, breathes, and
// when you scroll down the ring opens up and fades so the content takes over.
// - mouse: the ring follows it softly
// - touch / idle: it wanders on its own; a tap pulls it towards the finger
// - dark theme: softer, glowing tones; light theme: deeper ones
// Pauses in background tabs; one static frame for reduced motion.

type Dot = {
  hx: number; // home position
  hy: number;
  x: number;
  y: number;
  phase: number;
};

// right (0) → left (1) around the ring
const LIGHT_STOPS = [
  [226, 72, 140], // pink
  [139, 92, 246], // violet
  [66, 103, 232], // blue
];
const DARK_STOPS = [
  [244, 114, 182],
  [167, 139, 250],
  [107, 140, 255],
];
const COLORS = 12;
const ALPHAS = 6;

function palette(stops: number[][]) {
  return Array.from({ length: COLORS }, (_, i) => {
    const t = i / (COLORS - 1);
    const s = t * (stops.length - 1);
    const k = Math.min(stops.length - 2, Math.floor(s));
    const f = s - k;
    return stops[k].map((c, j) => Math.round(c + (stops[k + 1][j] - c) * f));
  });
}
const LIGHT = palette(LIGHT_STOPS);
const DARK = palette(DARK_STOPS);

const smooth = (t: number) => t * t * (3 - 2 * t);
const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

function Field() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let lite = false; // phones / tablets: fewer particles, 30 fps
    let dots: Dot[] = [];
    let radius = 600; // the ring
    let frame = 0;
    let running = false;
    let last = performance.now();
    let skip = false;
    let scroll = 0; // 0 at the top → 1 one screen down (smoothed)

    const pointer = { x: 0, y: 0, active: false, lastMove: 0 };
    const focus = { x: 0, y: 0 }; // smoothed centre of the ring

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = document.documentElement.clientWidth;
      height = window.innerHeight;
      lite = width < 1024 || window.matchMedia("(pointer: coarse)").matches;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      radius = lite ? Math.max(width, height) * 0.46 : Math.max(380, Math.min(680, Math.max(width, height) * 0.36));
      const gap = lite ? 34 : 30;
      dots = [];
      for (let y = gap / 2; y < height + gap; y += gap) {
        for (let x = gap / 2; x < width + gap; x += gap) {
          const hx = x + (Math.random() - 0.5) * gap * 0.95;
          const hy = y + (Math.random() - 0.5) * gap * 0.95;
          dots.push({ hx, hy, x: hx, y: hy, phase: Math.random() * Math.PI * 2 });
        }
      }
      if (!focus.x && !focus.y) {
        focus.x = width * 0.5;
        focus.y = height * 0.5;
      }
    }

    function draw(now: number) {
      const dt = Math.min(48, now - last);
      last = now;
      const step = dt / 16;
      const dark = document.documentElement.classList.contains("dark");
      const pal = dark ? DARK : LIGHT;
      ctx!.clearRect(0, 0, width, height);

      // Follow the pointer, or wander slowly
      const following = pointer.active && now - pointer.lastMove < (lite ? 2500 : 6000);
      const tx = following ? pointer.x : width * (0.5 + 0.16 * Math.sin(now * 0.00011));
      const ty = following ? pointer.y : height * (0.5 + 0.12 * Math.sin(now * 0.00017 + 1.1));
      const follow = (following ? 0.06 : 0.015) * step;
      focus.x += (tx - focus.x) * follow;
      focus.y += (ty - focus.y) * follow;

      const target = clamp01(window.scrollY / Math.max(1, height));
      scroll += (target - scroll) * Math.min(1, 0.12 * step);

      // breathing ring that opens up as you scroll
      const R = radius * (1 + 0.035 * Math.sin(now * 0.0009)) * (1 + scroll * 0.7);
      const fade = 1 - scroll * 0.6;
      const sway = 0.12 * Math.sin(now * 0.00016); // slow rotation back and forth

      const dashes: Path2D[] = Array.from({ length: COLORS * ALPHAS }, () => new Path2D());
      const specks = new Path2D();
      const ease = Math.min(1, 0.1 * step);

      for (const d of dots) {
        const dx0 = d.hx - focus.x;
        const dy0 = d.hy - focus.y;
        const r0 = Math.hypot(dx0, dy0) || 1;
        const t0 = r0 / R;

        // rotate the inside of the ring a little (fades out past the rim)
        const k = sway * (1 - smooth(clamp01((t0 - 0.9) / 0.5)));
        const cos = Math.cos(k);
        const sin = Math.sin(k);
        const dx = dx0 * cos - dy0 * sin;
        const dy = dx0 * sin + dy0 * cos;
        const r = r0;
        const ux = dx / r;
        const uy = dy / r;
        const t = t0;

        // rings rolling outward + a little drift
        const wave = 0.5 + 0.5 * Math.sin(r * 0.035 - now * 0.0022 + d.phase * 0.3);
        const inside = t < 1;
        const push = inside ? Math.pow(1 - t, 2.4) * 26 + wave * 4 : 0; // the middle stays open
        const gx = focus.x + dx + ux * push + Math.sin(now * 0.0005 + d.phase) * 1.6;
        const gy = focus.y + dy + uy * push + Math.cos(now * 0.0004 + d.phase * 1.3) * 1.6;
        d.x += (gx - d.x) * ease;
        d.y += (gy - d.y) * ease;

        // soft rim: fully lit inside, gone ~12% past it
        const rim = 1 - smooth(clamp01((t - 0.94) / 0.14));
        // the sparser, quieter middle; brightest close to the rim
        const body = 0.18 + 0.82 * smooth(clamp01((t - 0.15) / 0.75));
        // only ~70% of the particles turn into dashes, so it stays airy
        const lit = d.phase < 4.4;
        const alpha = lit ? rim * body * (0.35 + 0.65 * wave) * fade * (dark ? 0.9 : 1) : 0;

        if (alpha < 0.06) {
          specks.rect(d.x - 0.65, d.y - 0.65, 1.3, 1.3);
          continue;
        }

        const len = (1.4 + 2.6 * body) * (0.7 + 0.45 * wave);
        // colour by angle: right = pink, left = blue (with a tiny per-dot shift)
        const u = clamp01((1 - ux) / 2 + Math.sin(d.phase) * 0.06);
        const ci = Math.min(COLORS - 1, Math.floor(u * COLORS));
        const ai = Math.min(ALPHAS - 1, Math.floor(alpha * ALPHAS));
        const path = dashes[ci * ALPHAS + ai];
        path.moveTo(d.x - ux * len, d.y - uy * len);
        path.lineTo(d.x + ux * len, d.y + uy * len);
      }

      ctx!.fillStyle = dark ? "rgba(148,163,184,0.2)" : "rgba(60,64,67,0.28)";
      ctx!.fill(specks);

      ctx!.lineCap = "round";
      ctx!.lineWidth = lite ? 2.2 : 2.6;
      if (dark) {
        // a faint glow so the colours shine without being harsh
        ctx!.shadowBlur = lite ? 0 : 6;
      }
      for (let ci = 0; ci < COLORS; ci++) {
        const [r, g, b] = pal[ci];
        if (dark && !lite) ctx!.shadowColor = `rgba(${r},${g},${b},0.55)`;
        for (let ai = 0; ai < ALPHAS; ai++) {
          ctx!.strokeStyle = `rgba(${r},${g},${b},${((ai + 0.5) / ALPHAS).toFixed(2)})`;
          ctx!.stroke(dashes[ci * ALPHAS + ai]);
        }
      }
      ctx!.shadowBlur = 0;
    }

    function loop(now: number) {
      frame = requestAnimationFrame(loop);
      // phones: every other frame (~30 fps) to save battery
      if (lite && (skip = !skip)) return;
      draw(now);
    }
    function start() {
      if (running || reduceMotion || document.hidden) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function track(e: PointerEvent) {
      // touch "moves" are scrolls; a tap (pointerdown) still pulls the ring
      if (e.pointerType === "touch" && e.type === "pointermove") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.lastMove = performance.now();
    }
    function onLeave() {
      pointer.active = false;
    }
    function onResize() {
      // mobile browsers resize on every scroll (address bar); rebuild only
      // when the width changes or the height changes a lot
      const w = document.documentElement.clientWidth;
      if (w === width && Math.abs(window.innerHeight - height) < 120) return;
      build();
      if (!running) draw(performance.now());
    }
    const onVisibility = () => (document.hidden ? stop() : start());

    build();
    draw(performance.now());
    start();

    const theme = new MutationObserver(() => !running && draw(performance.now()));
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("pointerdown", track, { passive: true });
    window.addEventListener("resize", onResize);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      theme.disconnect();
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointerdown", track);
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}

export default function ParticleField() {
  const pathname = usePathname();
  if (pathname !== "/") return null;
  return <Field />;
}
