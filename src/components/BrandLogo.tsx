import Image from "next/image";

type Props = {
  className?: string;
  /** Compacto en una sola línea para el header */
  variant?: "stack" | "horizontal" | "mark";
  inverted?: boolean;
  /** Si es false, solo texto (sin icono) */
  showIcon?: boolean;
};

export function BrandLogo({
  className = "",
  variant = "stack",
  inverted = false,
  showIcon = true,
}: Props) {
  const sage = inverted ? "#c5d2bf" : "var(--accent)";
  const gold = inverted ? "#e0c9a8" : "var(--gold)";

  const turtle = showIcon ? (
    <Image
      src="/brand/tortuga-icon.png"
      alt=""
      width={96}
      height={42}
      className={
        variant === "mark"
          ? "h-7 w-auto object-contain"
          : "h-7 w-auto shrink-0 object-contain sm:h-8"
      }
      sizes="96px"
      aria-hidden
      priority={variant !== "stack"}
    />
  ) : null;

  if (variant === "mark") {
    return <span className={`inline-flex items-center ${className}`}>{turtle}</span>;
  }

  if (variant === "horizontal") {
    return (
      <span className={`inline-flex items-center gap-2 ${className}`}>
        {turtle}
        <span className="flex flex-col text-left leading-none">
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
