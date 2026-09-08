"use client";

import { FormEvent, useState } from "react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "ok" | "error">("idle");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setStatus("idle");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("fail");
      setStatus("ok");
      setEmail("");
    } catch {
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="border-y border-line bg-bg-deep">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-sm uppercase tracking-[0.2em] text-accent">15% OFF</p>
          <h2 className="mt-2 font-[family-name:var(--font-display)] text-3xl md:text-4xl">
            Llevate un 15% OFF en tu primera compra
          </h2>
          <p className="mt-3 text-ink-soft">
            Dejanos tu email y recibí tu código de descuento exclusivo.
          </p>
        </div>
        <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Tu email"
            className="magi-input"
          />
          <button type="submit" className="magi-btn whitespace-nowrap" disabled={loading}>
            {loading ? "Enviando..." : "Suscribirme"}
          </button>
        </form>
      </div>
      {status === "ok" && (
        <p className="px-4 pb-6 text-center text-sm text-success">
          ¡Gracias! Usá el cupón <strong>MAGI15</strong> en el checkout.
        </p>
      )}
      {status === "error" && (
        <p className="px-4 pb-6 text-center text-sm text-accent">
          No pudimos registrar el email. Intentá de nuevo.
        </p>
      )}
    </section>
  );
}
