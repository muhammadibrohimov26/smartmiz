"use client";

import { useEffect, useRef, useState } from "react";

// Counts the first number in `text` up from 0 when it scrolls into view
// ("12 Yillik", "3 000+ oʻquvchi"), then shows `text` exactly as given.
// Reduced motion / no number: just the text.
const NUMBER = /\d[\d\s.,  ]*\d|\d/;

export default function CountUp({ text, duration = 1600 }: { text: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [shown, setShown] = useState(text);

  useEffect(() => {
    setShown(text);
    const el = ref.current;
    const match = text.match(NUMBER);
    if (!el || !match || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const target = parseInt(match[0].replace(/\D/g, ""), 10);
    if (!target) return;
    const sep = match[0].match(/[\s.,  ]/)?.[0] ?? "";
    const format = (n: number) => (sep ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, sep) : String(n));
    const render = (n: number) => text.replace(match[0], format(n));

    let frame = 0;
    setShown(render(0));
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 4);
          setShown(p < 1 ? render(Math.round(target * eased)) : text);
          if (p < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [text, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {shown}
    </span>
  );
}
