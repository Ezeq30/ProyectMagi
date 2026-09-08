type Props = { text: string };

export function PromoBanner({ text }: Props) {
  const items = Array.from({ length: 8 }, () => text);
  return (
    <div className="overflow-hidden bg-ink text-white text-xs md:text-sm tracking-wide">
      <div className="magi-marquee-track py-2.5">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="mx-6 whitespace-nowrap opacity-95">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
