import { cookies } from "next/headers";
import { createHash, timingSafeEqual } from "crypto";

const COOKIE_NAME = "magi_admin_session";

function hashPassword(password: string): string {
  const salt = process.env.ADMIN_PASSWORD_SALT ?? "accesorios-magi";
  return createHash("sha256").update(`${salt}:${password}`).digest("hex");
}

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD ?? "magiadmin";
}

export function verifyAdminPassword(password: string): boolean {
  const expected = Buffer.from(hashPassword(getAdminPassword()));
  const provided = Buffer.from(hashPassword(password));
  if (expected.length !== provided.length) return false;
  return timingSafeEqual(expected, provided);
}

export function sessionToken(): string {
  return hashPassword(`session:${getAdminPassword()}`);
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
