type Props = { text: string };

export function PromoBanner({ text }: Props) {
  const items = Array.from({ length: 8 }, () => text);
  return (
    <div className="overflow-hidden border-b border-line bg-ink text-[11px] tracking-[0.14em] text-[color:var(--bg)] md:text-xs">
      <div className="magi-marquee-track py-2.5">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-8 whitespace-nowrap uppercase opacity-95">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
