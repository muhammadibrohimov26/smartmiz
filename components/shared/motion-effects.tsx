"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Site-wide motion for the public pages, driven by data attributes so the
// components stay plain markup (styles live in app/globals.css, "Motion"):
//
//   data-reveal="up|down|left|right|zoom|blur"   fades in when scrolled into view
//   data-reveal-stagger                          its [data-reveal] children follow
//                                                one another (90 ms apart)
//   data-tilt                                    3D tilt + a light that follows the
//                                                pointer (cards)
//   data-magnetic                                leans towards the pointer (buttons)
//   data-parallax="0.3"                          moves slower than the page on scroll
//   data-hero-fade                               fades and sinks as you scroll past
//
// Plus a scroll progress bar at the top and `html.is-scrolled` for the navbar.
// Hover effects only for a real mouse; everything off for reduced motion.
// The `motion-ready` class (which hides not-yet-revealed elements) is set by an
// inline script in app/layout.tsx before the first paint, with a fallback
// that shows everything if this component never starts.

const STAGGER_MS = 90;

export default function MotionEffects() {
  const pathname = usePathname();
  const barRef = useRef<HTMLDivElement>(null);

  // Scroll reveal — re-scanned on every page (and when content is added)
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("motion-live");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-revealed");
          io.unobserve(e.target);
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>("[data-reveal-stagger]").forEach((group) => {
        let i = 0;
        group.querySelectorAll<HTMLElement>(":scope > [data-reveal]").forEach((el) => {
          if (!el.style.getPropertyValue("--reveal-delay")) el.style.setProperty("--reveal-delay", `${Math.min(i, 10) * STAGGER_MS}ms`);
          i++;
        });
      });
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-revealed)").forEach((el) => {
        if (reduce) el.classList.add("is-revealed");
        else io.observe(el);
      });
    };
    scan();
    let queued = false;
    const mo = new MutationObserver(() => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  // Scroll: progress bar, navbar state, parallax, hero fade
  useEffect(() => {
    const root = document.documentElement;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const max = root.scrollHeight - window.innerHeight;
      if (barRef.current) barRef.current.style.transform = `scaleX(${max > 0 ? Math.min(1, y / max) : 0})`;
      root.classList.toggle("is-scrolled", y > 12);
      // at the very bottom, whatever is left (the footer's last row) can never
      // scroll further into view — show it
      if (max > 0 && y >= max - 4) {
        document.querySelectorAll("[data-reveal]:not(.is-revealed)").forEach((el) => el.classList.add("is-revealed"));
      }
      if (reduce) return;

      document.querySelectorAll<HTMLElement>("[data-parallax]").forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.2");
        const r = el.getBoundingClientRect();
        // 0 when the element is centred in the viewport
        const offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = `translate3d(0, ${(-offset).toFixed(1)}px, 0)`;
      });
      const vh = window.innerHeight;
      document.querySelectorAll<HTMLElement>("[data-hero-fade]").forEach((el) => {
        const p = Math.min(1, y / (vh * 0.75));
        el.style.opacity = String(1 - p * 0.9);
        el.style.transform = `translate3d(0, ${(p * 60).toFixed(1)}px, 0) scale(${(1 - p * 0.06).toFixed(3)})`;
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  // Pointer: tilt + spotlight on cards, magnetic buttons (mouse only)
  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;

    let tilted: HTMLElement | null = null;
    let magnet: HTMLElement | null = null;

    const resetTilt = (el: HTMLElement) => {
      el.style.removeProperty("--tilt-x");
      el.style.removeProperty("--tilt-y");
      el.classList.remove("is-tilting");
    };
    const resetMagnet = (el: HTMLElement) => {
      el.style.removeProperty("--mag-x");
      el.style.removeProperty("--mag-y");
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const target = e.target as Element | null;

      const card = target?.closest<HTMLElement>("[data-tilt]") ?? null;
      if (tilted && tilted !== card) resetTilt(tilted);
      tilted = card;
      if (card) {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        card.style.setProperty("--spot-x", `${(px * 100).toFixed(1)}%`);
        card.style.setProperty("--spot-y", `${(py * 100).toFixed(1)}%`);
        // gentle: at most ~5° each way
        card.style.setProperty("--tilt-x", `${((0.5 - py) * 9).toFixed(2)}deg`);
        card.style.setProperty("--tilt-y", `${((px - 0.5) * 9).toFixed(2)}deg`);
        card.classList.add("is-tilting");
      }

      const btn = target?.closest<HTMLElement>("[data-magnetic]") ?? null;
      if (magnet && magnet !== btn) resetMagnet(magnet);
      magnet = btn;
      if (btn) {
        const r = btn.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2);
        const dy = e.clientY - (r.top + r.height / 2);
        btn.style.setProperty("--mag-x", `${(dx * 0.22).toFixed(1)}px`);
        btn.style.setProperty("--mag-y", `${(dy * 0.3).toFixed(1)}px`);
      }
    };
    const onLeave = () => {
      if (tilted) resetTilt(tilted);
      if (magnet) resetMagnet(magnet);
      tilted = magnet = null;
    };

    document.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);
    return () => {
      document.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div aria-hidden="true" className="scroll-progress">
      <div ref={barRef} className="scroll-progress__bar" />
    </div>
  );
}
