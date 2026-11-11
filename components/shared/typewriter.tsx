"use client";

import { useEffect, useRef, useState } from "react";

// Types `text` out letter by letter once it scrolls into view, with a
// blinking caret. The not-yet-typed rest is rendered transparent, so the
// layout (line breaks, height) is final from the first paint and nothing
// jumps; screen readers and search engines get the full text.
// Chain several on one line with `delay` (e.g. the second half of a title
// starts after the first: delay = first.length * speed).
// Reduced motion: the text is shown at once.
type Props = {
  text: string;
  /** ms before typing starts (after coming into view) */
  delay?: number;
  /** ms per character */
  speed?: number;
  /** keep the caret blinking after the text is finished */
  keepCaret?: boolean;
  className?: string;
};

export default function Typewriter({ text, delay = 0, speed = 45, keepCaret = false, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      return;
    }
    setCount(0);
    setStarted(false);

    let timer: ReturnType<typeof setTimeout> | undefined;
    let interval: ReturnType<typeof setInterval> | undefined;
    const run = () => {
      timer = setTimeout(() => {
        setStarted(true);
        interval = setInterval(() => {
          setCount((c) => {
            if (c + 1 >= text.length) clearInterval(interval);
            return Math.min(text.length, c + 1);
          });
        }, speed);
      }, delay);
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        run();
      },
      { threshold: 0.2 },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [text, delay, speed]);

  const done = count >= text.length;
  const showCaret = started && (!done || keepCaret);

  return (
    <span ref={ref} className={className}>
      {text.slice(0, count)}
      {showCaret && (
        <span aria-hidden="true" className="relative">
          <span className="typewriter-caret absolute left-[0.04em] top-[0.1em] h-[0.9em] w-[0.07em] rounded-sm bg-current" />
        </span>
      )}
      <span className="text-transparent">{text.slice(count)}</span>
    </span>
  );
}
