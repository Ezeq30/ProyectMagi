import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./client";

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

function adminPassword(): string {
  return env("ADMIN_PASSWORD") || "Maitena1";
}

export function hasServiceRole(): boolean {
  return Boolean(env("NEXT_PUBLIC_SUPABASE_URL") && env("SUPABASE_SERVICE_ROLE_KEY"));
}

/** En Vercel no se puede escribir store.json (filesystem read-only). */
export function canUseLocalStore(): boolean {
  return !process.env.VERCEL;
}

/** Escrituras vía RPC security definer + password de admin (sin service_role). */
export function canUseAdminRpc(): boolean {
  return isSupabaseConfigured() && Boolean(adminPassword());
}

export function getAdminWriteToken(): string {
  return adminPassword();
}

export function requireSupabaseWrites(): void {
  if (hasServiceRole() || canUseAdminRpc()) return;
  throw new Error(
    "No se puede guardar en producción: configurá SUPABASE_SERVICE_ROLE_KEY o ADMIN_PASSWORD.",
  );
}

export function createServiceClient(): SupabaseClient {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  const key = env("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. Copiala desde Supabase → Project Settings → API.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cliente con privilegios de servidor: service role si hay, si no anon (lecturas + RPC admin). */
export function createServerDataClient(): SupabaseClient {
  const url = env("NEXT_PUBLIC_SUPABASE_URL");
  if (!url) throw new Error("Supabase URL no configurada");

  if (hasServiceRole()) return createServiceClient();

  const anon = env("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (!anon) throw new Error("Supabase anon key no configurada");
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function useSupabaseData(): boolean {
  return isSupabaseConfigured();
}
