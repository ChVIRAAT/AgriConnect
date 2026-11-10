import { NextResponse } from "next/server";
import { destroySession } from "@/lib/session";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("logout error", err);
    return NextResponse.json({ error: "Logout failed. Please try again." }, { status: 500 });
  }
}
