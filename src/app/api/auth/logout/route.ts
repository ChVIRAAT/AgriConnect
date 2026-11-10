import { NextResponse } from "next/server";
import { destroySession, getCurrentUser } from "@/lib/session";
import { persistDatabase } from "@/lib/db";

export async function POST() {
  const user = await getCurrentUser();
  await destroySession();
  if (user) await persistDatabase();
  return NextResponse.json({ ok: true });
}
