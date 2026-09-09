import { createBrowserClient } from "@supabase/ssr";

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

export function isSupabaseConfigured(): boolean {
  return Boolean(env("NEXT_PUBLIC_SUPABASE_URL") && env("NEXT_PUBLIC_SUPABASE_ANON_KEY"));
}

export function createClient() {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!url || !key) {
    throw new Error("Supabase no está configurado");
  }
  return createBrowserClient(url, key);
}
