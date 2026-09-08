import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "./client";

export function hasServiceRole(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function createServiceClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Falta SUPABASE_SERVICE_ROLE_KEY. Copiala desde Supabase → Project Settings → API.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/** Cliente con privilegios de servidor: service role si hay, si no anon (solo lecturas públicas). */
export function createServerDataClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new Error("Supabase URL no configurada");

  if (hasServiceRole()) return createServiceClient();

  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!anon) throw new Error("Supabase anon key no configurada");
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export function useSupabaseData(): boolean {
  return isSupabaseConfigured();
}
