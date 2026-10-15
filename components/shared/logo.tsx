import { useId } from "react";
import { cn } from "@/lib/utils";

// Smartmiz wordmark, drawn with geometric strokes (no font needed, sharp at any
// size). "SMART" uses currentColor, so it follows the theme; the chevron "A"
// holds the logo's green triangle and "MIZ" is in the accent green
// (--logo-accent: brighter on dark, deeper on light for contrast).
// Standalone copies: public/logo-dark.svg and public/logo-light.svg.
export default function Logo({ className, title = "Smartmiz" }: { className?: string; title?: string }) {
  const clip = useId();
  return (
    <svg
      viewBox="0 4 244 44"
      role="img"
      aria-label={title}
      className={cn("h-8 w-auto", className)}
      fill="none"
      strokeWidth={7}
      strokeLinejoin="miter"
      strokeMiterlimit={2}
    >
      {/* cut the slanted leg ends of A and R flat at the baseline */}
      <clipPath id={clip}>
        <rect x="-4" y="0" width="252" height="46" />
      </clipPath>
      <g clipPath={`url(#${clip})`}>
        <g stroke="currentColor">
          <path d="M25 13.5H10.75a7.25 7.25 0 0 0 0 14.5h5.5a7.25 7.25 0 0 1 0 14.5H2" />
          <path d="M34.5 46V12L47 30l12.5-18v34" />
          <path d="M67 48l16-38 16 38" />
          <path d="M108.5 46V13.5H120a7.25 7.25 0 0 1 0 14.5h-11.5M118.5 28l10 19" />
          <path d="M133 13.5h26M146 13.5V46" />
        </g>
        <path d="M83 31l7 15H76z" fill="var(--logo-accent, #4BE033)" />
        <g stroke="var(--logo-accent, #4BE033)">
          <path d="M170.5 46V12L183 30l12.5-18v34" />
          <path d="M206.5 10v36" />
          <path d="M214 13.5h25L215 42.5h25" />
        </g>
      </g>
    </svg>
  );
}
