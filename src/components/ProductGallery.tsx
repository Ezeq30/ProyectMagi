"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  name: string;
  images: string[];
};

export function ProductGallery({ name, images }: Props) {
  const list =
    images.length > 0
      ? images.slice(0, 5)
      : ["https://placehold.co/800x1000/c4a574/f7f0e8/png?text=Magi"];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] sm:aspect-[5/4] lg:aspect-square overflow-hidden bg-bg-deep">
        <Image
          src={current}
          alt={name}
          fill
          className="object-contain p-2 sm:p-4"
          priority
          sizes="(max-width:768px) 100vw, 50vw"
        />
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {list.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setActive(i)}
              className={`relative h-14 w-14 shrink-0 overflow-hidden border sm:h-20 sm:w-20 ${
                i === active ? "border-ink" : "border-line"
              }`}
              aria-label={`Ver foto ${i + 1}`}
            >
              <Image src={url} alt="" fill className="object-cover" sizes="80px" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
