"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function SiteMotion() {
  const progress = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const root = document.querySelector(".public-site");
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -40px 0px" });
    const discover = () => {
      root.querySelectorAll("[data-reveal], section, .course-card, .page-heading").forEach(node => {
        // already shown; others are (re)observed, also after an effect re-run
        if (node.classList.contains("is-visible")) return;
        node.setAttribute("data-motion-ready", "true");
        if (!reduced.matches) observer.observe(node);
        else node.classList.add("is-visible");
      });
    };
    discover();
    const mutations = new MutationObserver(discover);
    mutations.observe(root, { childList: true, subtree: true });
    let frame = 0;
    const update = () => {
      frame = 0;
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      if (progress.current) progress.current.style.transform = `scaleX(${distance > 0 ? window.scrollY / distance : 0})`;
      root.classList.toggle("has-scrolled", window.scrollY > 24);
    };
    const scroll = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", scroll, { passive: true });
    window.addEventListener("resize", scroll);
    return () => {
      observer.disconnect();
      mutations.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scroll);
      window.removeEventListener("resize", scroll);
    };
  }, [pathname]);

  return <div ref={progress} className="reading-progress" aria-hidden="true" />;
}
