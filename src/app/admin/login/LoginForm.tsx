"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    setLoading(false);
    if (!res.ok) {
      setError("Email o contraseña incorrectos");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-md rounded-xl border border-line bg-white p-6 shadow-sm sm:p-8">
      <h1 className="font-[family-name:var(--font-display)] text-3xl">
        Login
      </h1>
      <p className="mt-2 text-sm text-ink-soft">
        Accesorios Tortugas Online — mismo usuario en local y en Vercel.
      </p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Email</span>
          <input
            type="email"
            className="magi-input"
            placeholder="vildozasara10@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="username"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1 block text-ink-soft">Contraseña</span>
          <input
            type="password"
            className="magi-input"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </label>
        {error && <p className="text-sm text-accent">{error}</p>}
        <button type="submit" className="magi-btn w-full" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </div>
  );
}
