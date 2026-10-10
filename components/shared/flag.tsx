import { useId } from "react";

// SVG flags — Windows does not render flag emojis (shows "GB", "KR" instead).

type FlagCode = "gb" | "kr";

function Flag({ code, className }: { code: FlagCode; className?: string }) {
  const id = useId();

  if (code === "gb") {
    return (
      <svg viewBox="0 0 60 30" className={className} role="img" aria-label="United Kingdom">
        <clipPath id={`${id}-s`}><path d="M0,0 v30 h60 v-30 z" /></clipPath>
        <clipPath id={`${id}-t`}><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" /></clipPath>
        <g clipPath={`url(#${id}-s)`}>
          <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
          <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
          <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#${id}-t)`} stroke="#C8102E" strokeWidth="4" />
          <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
          <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
        </g>
      </svg>
    );
  }

  // South Korea (trigrams simplified to solid bars — fine at icon size)
  return (
    <svg viewBox="-36 -24 72 48" className={className} role="img" aria-label="South Korea">
      <rect x="-36" y="-24" width="72" height="48" fill="#fff" />
      <g transform="rotate(-33.69)">
        <path d="M-12,0 a12,12 0 0,1 24,0" fill="#CD2E3A" />
        <path d="M12,0 a12,12 0 0,1 -24,0" fill="#0047A0" />
        <circle cx="-6" r="6" fill="#CD2E3A" />
        <circle cx="6" r="6" fill="#0047A0" />
      </g>
      {[-56.31, 56.31, 123.69, -123.69].map((angle) => (
        <g key={angle} transform={`rotate(${angle})`} fill="#000">
          {[-24, -20.5, -17].map((y) => (
            <rect key={y} x="-6" y={y} width="12" height="2" />
          ))}
        </g>
      ))}
    </svg>
  );
}

export default Flag;
