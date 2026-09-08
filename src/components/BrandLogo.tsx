type Props = {
  className?: string;
  /** Compacto en una sola línea para el header */
  variant?: "stack" | "horizontal" | "mark";
  inverted?: boolean;
};

export function BrandLogo({
  className = "",
  variant = "stack",
  inverted = false,
}: Props) {
  const sage = inverted ? "#c5d2bf" : "var(--accent)";
  const gold = inverted ? "#e0c9a8" : "var(--gold)";

  const turtle = (
    <svg
      viewBox="0 0 120 58"
      className={
        variant === "mark"
          ? "h-8 w-auto"
          : variant === "horizontal"
            ? "h-7 w-auto shrink-0"
            : "h-8 w-auto md:h-9"
      }
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <g stroke={sage} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="58" cy="30" rx="28" ry="16" />
        <path d="M40 30c6-10 30-10 36 0" />
        <path d="M44 34c4-6 24-6 28 0" />
        <path d="M58 14v16" />
        <path d="M46 22l12 8 12-8" />
        <path d="M86 28c6-1 12 1 14 5" />
        <circle cx="100" cy="32" r="5.5" />
        <circle cx="102" cy="31" r="1" fill={sage} stroke="none" />
        <path d="M36 38c-4 4-6 8-4 10" />
        <path d="M48 42c-2 5-2 9 1 10" />
        <path d="M68 42c2 5 2 9-1 10" />
        <path d="M80 38c4 4 6 8 4 10" />
        <path d="M30 30c-4 0-7 2-8 5" />
      </g>
    </svg>
  );

  if (variant === "mark") {
    return <span className={className}>{turtle}</span>;
  }

  if (variant === "horizontal") {
    return (
      <span className={`inline-flex items-center gap-2.5 ${className}`}>
        {turtle}
        <span className="flex flex-col leading-none text-left">
          <span
            className="font-[family-name:var(--font-display)] text-[15px] tracking-wide sm:text-base"
            style={{ color: gold }}
          >
            Accesorios Tortugas
          </span>
          <span
            className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.28em]"
            style={{ color: sage }}
          >
            Online
          </span>
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex flex-col items-center text-center leading-none ${className}`}>
      {turtle}
      <span
        className="mt-1 font-[family-name:var(--font-display)] text-sm tracking-wide"
        style={{ color: gold }}
      >
        Accesorios Tortugas
      </span>
      <span
        className="mt-0.5 font-[family-name:var(--font-display)] text-[11px] font-semibold uppercase tracking-[0.35em]"
        style={{ color: sage }}
      >
        Online
      </span>
      <span
        className="mt-1.5 block h-px w-16"
        style={{ backgroundColor: sage, opacity: 0.7 }}
      />
      <span
        className="mt-1.5 text-[9px] uppercase tracking-[0.28em]"
        style={{ color: gold }}
      >
        Bags & Handbags
      </span>
    </span>
  );
}
