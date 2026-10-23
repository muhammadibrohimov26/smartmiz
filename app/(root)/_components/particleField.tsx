"use client";

import { useEffect, useRef } from "react";

// Site-wide interactive background, inspired by antigravity.google.
// A fixed, full-viewport canvas behind all public pages, covered evenly with
// short dashes that drift in a slow wave. Where the pointer moves over them
// they come alive: grow, light up (brand yellow at the cursor → logo green
// further out), turn to point at the cursor and step aside a little, then
// settle back once it has passed.
// - click/tap: a ring of binary code (0/1, scrambling) spreads from the
//   click, yellow at the front, and its shock wave pushes the dashes outward
// - scrolling: dashes lag behind with inertia, then settle
// - no pointer (phones, idle): a faint wandering glow keeps it alive
// Content sits above it (cards keep their own backgrounds), so it only shows
// in the open space. Pauses in background tabs; static for reduced motion.

type Dash = {
  hx: number; // home position
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number;
  angle: number;
};

// yellow #FFB800 → lime → logo green #4BE033
const STOPS = [
  [255, 184, 0],
  [214, 205, 20],
  [75, 224, 51],
];
const COLOR_BUCKETS = 8;
const ALPHA_BUCKETS = 6;

function mix(t: number) {
  const s = t * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(s));
  const f = s - i;
  return STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f));
}
const PALETTE = Array.from({ length: COLOR_BUCKETS }, (_, i) => mix(i / (COLOR_BUCKETS - 1)));

// Click ripple of scrambling binary digits
type Ripple = { x: number; y: number; start: number };
const DIGITS = "01";
const RIPPLE_MS = 1500;
const RIPPLE_BAND = 150; // px of digits behind the wave front
const MAX_RIPPLES = 4;
const CELL = 14; // monospace grid step
const hash = (x: number, y: number) => (Math.imul(x, 73856093) ^ Math.imul(y, 19349663)) >>> 0;

const smooth = (t: number) => t * t * (3 - 2 * t);

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let width = 0;
    let height = 0;
    let dashes: Dash[] = [];
    let reach = 220; // pointer influence radius
    let frame = 0;
    let running = false;
    let last = performance.now();
    let lastScroll = window.scrollY;

    const pointer = { x: 0, y: 0, active: false, lastMove: 0 };
    const focus = { x: 0, y: 0 }; // smoothed pointer
    let presence = 0; // 0 idle → 1 a real pointer is moving (smoothed)
    const ripples: Ripple[] = [];

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // clientWidth excludes the scrollbar, matching the CSS size of the canvas
      width = document.documentElement.clientWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      const small = width < 640;
      reach = small ? 150 : 230;
      // An even, slightly jittered grid over the whole screen
      const gap = small ? 30 : 34;
      dashes = [];
      for (let y = gap / 2; y < height + gap; y += gap) {
        for (let x = gap / 2; x < width + gap; x += gap) {
          const hx = x + (Math.random() - 0.5) * gap * 0.7;
          const hy = y + (Math.random() - 0.5) * gap * 0.7;
          dashes.push({ hx, hy, x: hx, y: hy, vx: 0, vy: 0, phase: Math.random() * Math.PI * 2, angle: 0 });
        }
      }
      if (!focus.x && !focus.y) {
        focus.x = width * 0.6;
        focus.y = height * 0.4;
      }
    }

    function drawRipples(now: number, dark: boolean) {
      for (let i = ripples.length - 1; i >= 0; i--) {
        if (now - ripples[i].start > RIPPLE_MS) ripples.splice(i, 1);
      }
      if (!ripples.length) return;

      const maxR = rippleMax();
      // Digits grouped by colour (front / middle / tail) × 6 alpha levels
      const groups: [number, number, string][][] = Array.from({ length: 18 }, () => []);

      for (const rp of ripples) {
        const p = (now - rp.start) / RIPPLE_MS;
        const R = (1 - Math.pow(1 - p, 3)) * maxR; // ease-out front radius
        const fade = Math.pow(1 - p, 0.8);
        const lo = Math.max(0, R - RIPPLE_BAND);
        const hi = R + 6;
        const x0 = Math.max(0, Math.floor((rp.x - hi) / CELL));
        const x1 = Math.min(Math.ceil(width / CELL), Math.ceil((rp.x + hi) / CELL));
        const y0 = Math.max(0, Math.floor((rp.y - hi) / CELL));
        const y1 = Math.min(Math.ceil(height / CELL), Math.ceil((rp.y + hi) / CELL));

        for (let gy = y0; gy <= y1; gy++) {
          for (let gx = x0; gx <= x1; gx++) {
            const cx = gx * CELL + CELL / 2;
            const cy = gy * CELL + CELL / 2;
            const dist = Math.hypot(cx - rp.x, cy - rp.y);
            if (dist < lo || dist > hi) continue;
            const h = hash(gx, gy);
            if (h % 6 === 0) continue; // a few gaps, like real output
            const behind = Math.max(0, R - dist); // 0 at the front
            const a = Math.pow(1 - behind / RIPPLE_BAND, 1.6) * fade;
            if (a < 0.06) continue;
            // each cell flips between 0 and 1 every ~80 ms (scramble)
            // (high bits of the hash, so neighbouring cells differ — the low
            // bit plus a shared clock would flip every cell to the same digit)
            const digit = DIGITS[((h >>> 7) ^ Math.floor(now / 80 + (h & 31))) & 1];
            const tone = behind < 20 ? 0 : behind < 64 ? 1 : 2;
            groups[tone * 6 + Math.min(5, Math.floor(a * 6))].push([cx, cy, digit]);
          }
        }
      }

      const tones = [
        [255, 184, 0], // front: brand yellow
        [75, 224, 51], // then: logo green
        dark ? [148, 163, 184] : [82, 82, 91], // tail: slate / zinc
      ];
      ctx!.font = `700 ${width < 640 ? 11 : 13}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
      groups.forEach((glyphs, gi) => {
        if (!glyphs.length) return;
        const [r, g, b] = tones[Math.floor(gi / 6)];
        ctx!.fillStyle = `rgba(${r},${g},${b},${(((gi % 6) + 0.5) / 6).toFixed(2)})`;
        for (const [x, y, ch] of glyphs) ctx!.fillText(ch, x, y);
      });
    }

    const rippleMax = () => Math.min(width < 640 ? 320 : 560, Math.max(width, height) * 0.6);

    function draw(now: number) {
      const dt = Math.min(48, now - last);
      last = now;
      const step = dt / 16;
      const dark = document.documentElement.classList.contains("dark");
      ctx!.clearRect(0, 0, width, height);

      // The pointer, or a slow wandering spot when there is none (phones, idle)
      const following = pointer.active && now - pointer.lastMove < 4000;
      presence += ((following ? 1 : 0) - presence) * 0.04 * step;
      const tx = following ? pointer.x : width * (0.5 + 0.32 * Math.sin(now * 0.00011));
      const ty = following ? pointer.y : height * (0.45 + 0.25 * Math.sin(now * 0.00017 + 1.1));
      const follow = (following ? 0.22 : 0.03) * step;
      focus.x += (tx - focus.x) * follow;
      focus.y += (ty - focus.y) * follow;

      const small = width < 640;
      const strength = 0.4 + 0.6 * presence; // the idle glow is weaker
      const base = dark ? 0.3 : 0.32; // resting dashes: visible but quiet
      const maxR = rippleMax();
      const waves = ripples.map((rp) => {
        const p = Math.min(1, (now - rp.start) / RIPPLE_MS);
        return { x: rp.x, y: rp.y, R: (1 - Math.pow(1 - p, 3)) * maxR, fade: 1 - p };
      });

      // Bucket by colour and alpha so ~1000 dashes need ~50 stroke calls
      const paths: Path2D[][] = PALETTE.map(() => Array.from({ length: ALPHA_BUCKETS }, () => new Path2D()));
      const spring = 0.06 * step;
      const damping = Math.pow(0.82, step);

      for (const d of dashes) {
        // Slow wave over the whole field: a gently turning flow direction
        const flow = Math.sin(d.hx * 0.006 + now * 0.0004) + Math.cos(d.hy * 0.007 - now * 0.00033);
        let angle = flow * 0.9 + d.phase * 0.15;
        let energy = 0; // 0 resting → 1 fully lit

        // Pointer: dashes nearby light up, point at the cursor and step aside
        let ox = 0;
        let oy = 0;
        const dx = d.hx - focus.x;
        const dy = d.hy - focus.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist < reach) {
          const f = smooth(1 - dist / reach) * strength;
          energy = f;
          const toCursor = Math.atan2(-dy, -dx);
          // blend the flow angle towards the cursor (shortest way round)
          const diff = Math.atan2(Math.sin(toCursor - angle), Math.cos(toCursor - angle));
          angle += diff * Math.min(1, f * 1.6);
          const push = f * (small ? 14 : 22);
          ox = (dx / dist) * push - (dy / dist) * push * 0.35; // outward + a little swirl
          oy = (dy / dist) * push + (dx / dist) * push * 0.35;
        }

        // Click shock waves: a bright band that shoves dashes outward
        for (const w of waves) {
          const wx = d.hx - w.x;
          const wy = d.hy - w.y;
          const wd = Math.hypot(wx, wy) || 1;
          const band = 1 - Math.abs(wd - w.R) / 70;
          if (band <= 0) continue;
          const k = band * w.fade;
          energy = Math.max(energy, k * 0.9);
          ox += (wx / wd) * k * 26;
          oy += (wy / wd) * k * 26;
          angle = Math.atan2(wy, wx);
        }

        // Spring towards home + offset (gentle overshoot), with scroll inertia in v
        d.vx = (d.vx + (d.hx + ox - d.x) * spring) * damping;
        d.vy = (d.vy + (d.hy + oy - d.y) * spring) * damping;
        d.x += d.vx * step;
        d.y += d.vy * step;
        d.angle += Math.atan2(Math.sin(angle - d.angle), Math.cos(angle - d.angle)) * Math.min(1, 0.18 * step);

        const alpha = base + (0.95 - base) * energy;
        const len = 2.2 + energy * (small ? 7 : 9);
        const ci = Math.min(COLOR_BUCKETS - 1, Math.floor((1 - energy) * COLOR_BUCKETS));
        const ai = Math.min(ALPHA_BUCKETS - 1, Math.floor(alpha * ALPHA_BUCKETS));
        const cos = Math.cos(d.angle) * len;
        const sin = Math.sin(d.angle) * len;
        const path = paths[ci][ai];
        path.moveTo(d.x - cos, d.y - sin);
        path.lineTo(d.x + cos, d.y + sin);
      }

      ctx!.lineCap = "round";
      ctx!.lineWidth = small ? 1.6 : 1.8;
      for (let ci = 0; ci < COLOR_BUCKETS; ci++) {
        const [r, g, b] = ci === COLOR_BUCKETS - 1 && !dark ? [60, 150, 40] : PALETTE[ci];
        for (let ai = 0; ai < ALPHA_BUCKETS; ai++) {
          ctx!.strokeStyle = `rgba(${r},${g},${b},${((ai + 0.5) / ALPHA_BUCKETS).toFixed(2)})`;
          ctx!.stroke(paths[ci][ai]);
        }
      }

      drawRipples(now, dark);
    }

    function loop(now: number) {
      draw(now);
      frame = requestAnimationFrame(loop);
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
      // Touch "moves" are scrolls: only a mouse/pen hovering drives the glow
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.lastMove = performance.now();
    }
    function onDown(e: PointerEvent) {
      if (e.pointerType !== "touch") track(e);
      if (reduceMotion) return;
      ripples.push({ x: e.clientX, y: e.clientY, start: performance.now() });
      if (ripples.length > MAX_RIPPLES) ripples.shift();
    }
    function onLeave() {
      pointer.active = false;
    }
    // Content scrolls but the canvas is fixed: kick the dashes against the
    // scroll so they lag behind and spring back (inertia)
    function onScroll() {
      const delta = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      const kick = Math.max(-40, Math.min(40, delta)) * 0.35;
      for (const d of dashes) d.vy -= kick * (0.6 + 0.4 * Math.sin(d.phase));
      // ripples stay attached to the spot on the page that was clicked
      for (const rp of ripples) rp.y -= delta;
    }
    function onResize() {
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
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      theme.disconnect();
      window.removeEventListener("pointermove", track);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}
