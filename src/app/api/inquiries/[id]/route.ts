import { NextResponse } from "next/server";
import { all, persistDatabase, run } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const user = await getCurrentUser();
  if (!user || user.role !== "farmer") {
    return NextResponse.json({ error: "Not allowed." }, { status: 403 });
  }
  const { id } = await params;
  const inquiryId = Number(id);

  const rows = await all<{ id: number; farmer_id: number }>(
    "SELECT id, farmer_id FROM inquiries WHERE id = ?",
    [inquiryId]
  );
  if (rows.length === 0) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  if (rows[0].farmer_id !== user.id) {
    return NextResponse.json({ error: "You can only manage inquiries for your listings." }, { status: 403 });
  }

  const body = await request.json();
  const status = body.status === "contacted" ? "contacted" : body.status === "closed" ? "closed" : "new";
  await run("UPDATE inquiries SET status = ? WHERE id = ?", [status, inquiryId]);
  await persistDatabase();
  return NextResponse.json({ ok: true });
}
