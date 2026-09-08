import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

const COOKIE_NAME = "magi_admin_session";

function hash(value: string): string {
  const salt = process.env.ADMIN_PASSWORD_SALT ?? "accesorios-tortugas";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

export function getAdminEmail(): string {
  return (process.env.ADMIN_EMAIL ?? "vildozasara10@gmail.com").trim().toLowerCase();
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "Maitena1";
}

export function verifyAdminCredentials(email: string, password: string): boolean {
  const emailOk =
    email.trim().toLowerCase() === getAdminEmail();
  const expected = Buffer.from(hash(getAdminPassword()));
  const provided = Buffer.from(hash(password));
  const passwordOk =
    expected.length === provided.length && timingSafeEqual(expected, provided);
  return emailOk && passwordOk;
}

export function sessionToken(): string {
  return hash(`session:${getAdminEmail()}:${getAdminPassword()}`);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(COOKIE_NAME)?.value;
  if (!value) return false;
  const expected = sessionToken();
  try {
    return timingSafeEqual(Buffer.from(value), Buffer.from(expected));
  } catch {
    return false;
  }
}

export { COOKIE_NAME };
