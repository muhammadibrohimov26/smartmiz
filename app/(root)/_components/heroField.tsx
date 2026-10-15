"use client";

import { useEffect, useRef } from "react";

// Interactive hero background, inspired by antigravity.google:
// a vortex ring of short radial dashes that floats after the pointer on a
// spring (outer particles trail behind when it moves fast), slowly swirls and
// "breathes", coloured from brand yellow (inside) to the logo green (outside).
// A click/tap makes the ring burst outward and gather back. Without a pointer
// (phones, idle) the ring drifts on its own, smaller and softer so the hero
// text stays readable. A faint dot grid sits behind it.
// Pauses off-screen and in background tabs; static for prefers-reduced-motion.

type Particle = {
  r0: number; // home radius, 0..1 across the ring band
  theta0: number;
  spin: number; // rad/ms
  phase: number;
  x: number;
  y: number;
};

// yellow #FFB800 → lime → logo green #4BE033
const STOPS = [
  [255, 184, 0],
  [214, 205, 20],
  [75, 224, 51],
];
const COLOR_BUCKETS = 8;
const ALPHA_BUCKETS = 5;

function mix(t: number) {
  const s = t * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(s));
  const f = s - i;
  return STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f));
}
const PALETTE = Array.from({ length: COLOR_BUCKETS }, (_, i) => mix(i / (COLOR_BUCKETS - 1)));

export default function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let dotsPath = new Path2D();
    let inner = 60;
    let outer = 300;
    let frame = 0;
    let running = false;
    let visible = true;
    let last = performance.now();

    const pointer = { x: 0, y: 0, active: false, lastMove: 0 };
    const center = { x: 0, y: 0, vx: 0, vy: 0 };
    let burst = 0; // 1 right after a click, decays to 0
    let presence = 0; // 0 idle → 1 following a real pointer (smoothed)

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const small = width < 640;
      inner = small ? 56 : 110;
      outer = Math.min(small ? 210 : 380, Math.max(width, height) * 0.42);
      const count = small ? 300 : 620;
      particles = Array.from({ length: count }, () => {
        // more particles towards the outside of the band, like a galaxy disc
        const r0 = Math.sqrt(Math.random());
        return {
          r0,
          theta0: Math.random() * Math.PI * 2,
          spin: (0.00006 + Math.random() * 0.00008) * (1.2 - r0 * 0.6),
          phase: Math.random() * Math.PI * 2,
          x: width / 2,
          y: height / 2,
        };
      });

      // faint background dot grid, prebuilt once per size
      dotsPath = new Path2D();
      const gap = small ? 26 : 30;
      for (let y = gap / 2; y < height; y += gap) {
        for (let x = gap / 2 + ((y / gap) % 2) * (gap / 2); x < width; x += gap) {
          dotsPath.rect(x, y, 1.3, 1.3);
        }
      }

      if (!center.x && !center.y) {
        center.x = width * 0.62;
        center.y = height * 0.42;
      }
    }

    function draw(now: number) {
      const dt = Math.min(48, now - last);
      last = now;
      const dark = document.documentElement.classList.contains("dark");
      ctx!.clearRect(0, 0, width, height);

      ctx!.fillStyle = dark ? "rgba(255,255,255,0.10)" : "rgba(24,24,27,0.12)";
      ctx!.fill(dotsPath);

      // Where the ring wants to be: the pointer, or a slow drifting path when idle
      const following = pointer.active && now - pointer.lastMove < 3000;
      presence += ((following ? 1 : 0) - presence) * 0.04;
      const tx = following ? pointer.x : width * (0.5 + 0.3 * Math.sin(now * 0.00021));
      const ty = following ? pointer.y : height * (0.45 + 0.22 * Math.sin(now * 0.00029 + 1.1));

      // Spring-follow (slightly underdamped → a soft overshoot)
      center.vx = (center.vx + (tx - center.x) * 0.045) * 0.84;
      center.vy = (center.vy + (ty - center.y) * 0.045) * 0.84;
      center.x += center.vx;
      center.y += center.vy;
      burst *= 0.94;

      const scale = 0.72 + presence * 0.28; // idle ring is smaller…
      const intensity = (width < 640 ? 0.5 : 0.65) + presence * (width < 640 ? 0.35 : 0.35); // …and softer
      const band = outer - inner;

      // Bucket particles by colour and alpha so ~900 dashes need ~40 stroke calls
      const paths: Path2D[][] = PALETTE.map(() => Array.from({ length: ALPHA_BUCKETS }, () => new Path2D()));

      for (const p of particles) {
        const theta = p.theta0 + now * p.spin;
        const breathe = 1 + 0.06 * Math.sin(now * 0.0011 + p.phase);
        const r = (inner + p.r0 * band) * scale * breathe + burst * (60 + p.r0 * 140);
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        // Home slot, minus a trail along the ring's velocity (outer particles lag more)
        const lag = 3 + p.r0 * 9;
        const hx = center.x + cos * r - center.vx * lag;
        const hy = center.y + sin * r - center.vy * lag;
        const ease = (0.14 - p.r0 * 0.08) * (dt / 16);
        p.x += (hx - p.x) * ease;
        p.y += (hy - p.y) * ease;

        // Fade in from the inner edge and out at the outer edge
        const edge = Math.sin(Math.PI * Math.min(1, Math.max(0, p.r0 * 0.92 + 0.04)));
        const alpha = edge * intensity;
        if (alpha < 0.03) continue;

        const len = 1.6 + p.r0 * 3.6 + burst * 5;
        const ci = Math.min(COLOR_BUCKETS - 1, Math.floor(p.r0 * COLOR_BUCKETS));
        const ai = Math.min(ALPHA_BUCKETS - 1, Math.floor(alpha * ALPHA_BUCKETS));
        const path = paths[ci][ai];
        path.moveTo(p.x - cos * len, p.y - sin * len);
        path.lineTo(p.x + cos * len, p.y + sin * len);
      }

      ctx!.lineCap = "round";
      ctx!.lineWidth = width < 640 ? 1.7 : 1.9;
      for (let ci = 0; ci < COLOR_BUCKETS; ci++) {
        const [r, g, b] = PALETTE[ci];
        for (let ai = 0; ai < ALPHA_BUCKETS; ai++) {
          ctx!.strokeStyle = `rgba(${r},${g},${b},${((ai + 0.5) / ALPHA_BUCKETS).toFixed(2)})`;
          ctx!.stroke(paths[ci][ai]);
        }
      }
    }

    function loop(now: number) {
      draw(now);
      frame = requestAnimationFrame(loop);
    }
    function start() {
      if (running || reduceMotion || !visible || document.hidden) return;
      running = true;
      last = performance.now();
      frame = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    function track(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      pointer.x = e.clientX - rect.left;
      pointer.y = e.clientY - rect.top;
      pointer.active = pointer.y >= -40 && pointer.y <= height + 40;
      pointer.lastMove = performance.now();
    }
    function onDown(e: PointerEvent) {
      track(e);
      if (pointer.active) burst = 1;
    }
    function onLeave() {
      pointer.active = false;
    }
    const onVisibility = () => (document.hidden ? stop() : start());

    build();
    if (reduceMotion) {
      // one settled frame
      for (const p of particles) {
        const r = inner + p.r0 * (outer - inner);
        p.x = center.x + Math.cos(p.theta0) * r;
        p.y = center.y + Math.sin(p.theta0) * r;
      }
    }
    draw(performance.now());
    start();

    const resize = new ResizeObserver(() => {
      build();
      if (!running) draw(performance.now());
    });
    resize.observe(canvas);
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(canvas);
    const theme = new MutationObserver(() => !running && draw(performance.now()));
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    window.addEventListener("pointermove", track, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      resize.disconnect();
      io.disconnect();
      theme.disconnect();
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointerdown", onDown);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 h-[100svh] w-full [mask-image:linear-gradient(to_bottom,black_70%,transparent)]"
    />
  );
}
