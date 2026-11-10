import { cookies } from "next/headers";
import { all, run } from "./db";

export const SESSION_COOKIE = "agri_session";

export type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: "farmer" | "consumer";
  phone: string | null;
  avatar: string;
  location: string | null;
  farm_name: string | null;
  bio: string | null;
};

export async function createSession(userId: number, token: string): Promise<void> {
  const now = new Date().toISOString();
  await run("INSERT INTO sessions (token, user_id, created_at) VALUES (?, ?, ?)", [
    token,
    userId,
    now,
  ]);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) await run("DELETE FROM sessions WHERE token = ?", [token]);
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await all<SessionUser>(
    `SELECT u.id, u.name, u.email, u.role, u.phone, u.avatar, u.location, u.farm_name, u.bio
     FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token = ?`,
    [token]
  );
  return rows.length > 0 ? rows[0] : null;
}
