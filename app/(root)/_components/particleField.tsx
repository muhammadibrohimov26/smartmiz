"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

// Interactive home-page background in the style of antigravity.google.
// Shown only on the home page ("/") and only on screens ≥ 1024px — on phones
// and tablets it is not mounted at all (no canvas, no animation loop).
//
// A fixed, full-viewport canvas covered evenly with particles. Far from the
// pointer they are tiny grey dots; around it they become short rounded dashes
// that point away from it, in rings that keep rolling outward. Colour runs
// red at the centre → violet → blue at the edge, and the dashes grow towards
// the edge, so the field looks like a tunnel opening up around the cursor.
// With no pointer (idle) the centre wanders slowly. Pauses in background
// tabs; a single static frame for reduced motion.

type Dot = {
  hx: number; // home position
  hy: number;
  x: number;
  y: number;
  phase: number;
};

// red → violet → blue
const STOPS = [
  [234, 67, 89],
  [178, 74, 170],
  [118, 86, 214],
  [72, 99, 230],
];
const COLORS = 10;
const ALPHAS = 6;
const WIDTHS = 3;

function mix(t: number) {
  const s = t * (STOPS.length - 1);
  const i = Math.min(STOPS.length - 2, Math.floor(s));
  const f = s - i;
  return STOPS[i].map((c, k) => Math.round(c + (STOPS[i + 1][k] - c) * f));
}
const PALETTE = Array.from({ length: COLORS }, (_, i) => mix(i / (COLORS - 1)));

const smooth = (t: number) => t * t * (3 - 2 * t);

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
    let dots: Dot[] = [];
    let reach = 600; // radius of the coloured area
    let frame = 0;
    let running = false;
    let last = performance.now();

    const pointer = { x: 0, y: 0, active: false, lastMove: 0 };
    const focus = { x: 0, y: 0 }; // smoothed centre of the field

    function build() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      // clientWidth excludes the scrollbar, matching the CSS size of the canvas
      width = document.documentElement.clientWidth;
      height = window.innerHeight;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      reach = Math.max(420, Math.min(780, Math.max(width, height) * 0.48));
      const gap = 36;
      dots = [];
      for (let y = gap / 2; y < height + gap; y += gap) {
        for (let x = gap / 2; x < width + gap; x += gap) {
          const hx = x + (Math.random() - 0.5) * gap * 0.9;
          const hy = y + (Math.random() - 0.5) * gap * 0.9;
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
      ctx!.clearRect(0, 0, width, height);

      // The pointer, or a slow wandering spot when there is none (idle)
      const following = pointer.active && now - pointer.lastMove < 5000;
      const tx = following ? pointer.x : width * (0.5 + 0.22 * Math.sin(now * 0.00013));
      const ty = following ? pointer.y : height * (0.5 + 0.18 * Math.sin(now * 0.00019 + 1.1));
      const follow = (following ? 0.07 : 0.02) * step;
      focus.x += (tx - focus.x) * follow;
      focus.y += (ty - focus.y) * follow;

      // Bucketed by colour × alpha × width so ~2000 particles need few strokes
      const dashes: Path2D[] = Array.from({ length: COLORS * ALPHAS * WIDTHS }, () => new Path2D());
      const specks = new Path2D();
      const ease = Math.min(1, 0.12 * step);

      for (const d of dots) {
        // a gentle drift so the resting field is never quite still
        const driftX = Math.sin(now * 0.0005 + d.phase) * 2;
        const driftY = Math.cos(now * 0.0004 + d.phase * 1.3) * 2;

        const dx = d.hx - focus.x;
        const dy = d.hy - focus.y;
        const r = Math.hypot(dx, dy) || 1;
        const ux = dx / r;
        const uy = dy / r;
        const t = r / reach; // 0 centre → 1 edge of the coloured area

        // rings rolling outward from the centre
        const wave = 0.5 + 0.5 * Math.sin(r * 0.04 - now * 0.0028 + d.phase * 0.25);
        // centre opens up: particles are pushed out of the middle, along the rings
        const inner = t < 1 ? Math.pow(1 - t, 3) : 0;
        const push = inner * 22 + (t < 1 ? wave * 5 * (1 - t) : 0);
        const gx = d.hx + driftX + ux * push;
        const gy = d.hy + driftY + uy * push;
        d.x += (gx - d.x) * ease;
        d.y += (gy - d.y) * ease;

        if (t >= 1) {
          specks.rect(d.x - 0.7, d.y - 0.7, 1.4, 1.4);
          continue;
        }

        // fade into the grey dots at the edge
        const edge = smooth(Math.min(1, (1 - t) / 0.25));
        const alpha = edge * (0.3 + 0.7 * wave) * (0.55 + 0.45 * smooth(Math.min(1, t * 3)));
        if (alpha < 0.05) {
          specks.rect(d.x - 0.7, d.y - 0.7, 1.4, 1.4);
          continue;
        }
        // short near the centre, longer and thicker towards the edge
        const len = (0.8 + 2.6 * smooth(t)) * (0.6 + 0.5 * wave) * edge + 0.5;
        const wi = Math.min(WIDTHS - 1, Math.floor(t * WIDTHS));
        const ci = Math.min(COLORS - 1, Math.floor(Math.pow(t, 1.3) * COLORS));
        const ai = Math.min(ALPHAS - 1, Math.floor(alpha * ALPHAS));
        const path = dashes[(ci * ALPHAS + ai) * WIDTHS + wi];
        path.moveTo(d.x - ux * len, d.y - uy * len);
        path.lineTo(d.x + ux * len, d.y + uy * len);
      }

      ctx!.fillStyle = dark ? "rgba(148,163,184,0.35)" : "rgba(60,64,67,0.32)";
      ctx!.fill(specks);

      ctx!.lineCap = "round";
      for (let ci = 0; ci < COLORS; ci++) {
        const [r, g, b] = PALETTE[ci];
        for (let ai = 0; ai < ALPHAS; ai++) {
          ctx!.strokeStyle = `rgba(${r},${g},${b},${((ai + 0.5) / ALPHAS).toFixed(2)})`;
          for (let wi = 0; wi < WIDTHS; wi++) {
            ctx!.lineWidth = 2.2 + wi * 0.5;
            ctx!.stroke(dashes[(ci * ALPHAS + ai) * WIDTHS + wi]);
          }
        }
      }
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
      if (e.pointerType === "touch") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      pointer.active = true;
      pointer.lastMove = performance.now();
    }
    function onLeave() {
      pointer.active = false;
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
    window.addEventListener("resize", onResize);
    document.documentElement.addEventListener("pointerleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      theme.disconnect();
      window.removeEventListener("pointermove", track);
      window.removeEventListener("resize", onResize);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 h-full w-full" />;
}

// Desktop only (phones and tablets hidden): matches Tailwind's `lg` breakpoint
const DESKTOP_QUERY = "(min-width: 1024px)";

export default function ParticleField() {
  const pathname = usePathname();
  const [desktop, setDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_QUERY);
    const update = () => setDesktop(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (pathname !== "/" || !desktop) return null;
  return <Field />;
}
