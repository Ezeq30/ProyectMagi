"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function HeaderSearch({ compact }: { compact?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const query = q.trim();
    if (!query) {
      router.push("/productos");
      return;
    }
    router.push(`/productos?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className={compact ? "w-full" : "hidden md:block"}
    >
      <label className="sr-only" htmlFor={compact ? "header-search-m" : "header-search"}>
        Buscar productos
      </label>
      <div className="relative">
        <input
          id={compact ? "header-search-m" : "header-search"}
          type="search"
          name="q"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar…"
          className="magi-input h-9 w-full min-w-0 border-line bg-transparent py-1.5 pr-9 pl-3 text-sm md:w-44 lg:w-52"
          autoComplete="off"
        />
        <button
          type="submit"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 text-ink-soft transition hover:text-ink"
          aria-label="Buscar"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </button>
      </div>
    </form>
  );
}
