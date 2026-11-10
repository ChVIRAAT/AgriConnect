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
  if (!Number.isSafeInteger(inquiryId) || inquiryId <= 0) {
    return NextResponse.json({ error: "Invalid inquiry ID." }, { status: 400 });
  }

  const rows = await all<{ id: number; farmer_id: number }>(
    "SELECT id, farmer_id FROM inquiries WHERE id = ?",
    [inquiryId]
  );
  if (rows.length === 0) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 });
  if (rows[0].farmer_id !== user.id) {
    return NextResponse.json({ error: "You can only manage inquiries for your listings." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await request.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ error: "Invalid inquiry update." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid inquiry update." }, { status: 400 });
  }

  if (
    body.status !== undefined &&
    body.status !== "new" &&
    body.status !== "contacted" &&
    body.status !== "closed"
  ) {
    return NextResponse.json({ error: "Invalid inquiry status." }, { status: 400 });
  }
  const hasResponse = Object.hasOwn(body, "response");
  if (!hasResponse && body.status === undefined) {
    return NextResponse.json({ error: "Provide a reply or inquiry status." }, { status: 400 });
  }

  let updateSql: string;
  let updateParams: unknown[];
  if (hasResponse) {
    if (typeof body.response !== "string") {
      return NextResponse.json({ error: "Reply must be text." }, { status: 400 });
    }
    const response = body.response.trim();
    if (!response || response.length > 2000) {
      return NextResponse.json({ error: "Reply must contain 1–2,000 characters." }, { status: 400 });
    }
    if (body.status !== undefined) {
      updateSql = `UPDATE inquiries SET farmer_response = ?, responded_at = ?, status = ?
                   WHERE id = ? AND farmer_id = ?`;
      updateParams = [response, new Date().toISOString(), body.status, inquiryId, user.id];
    } else {
      updateSql = `UPDATE inquiries
                   SET farmer_response = ?, responded_at = ?,
                       status = CASE WHEN status = 'new' THEN 'contacted' ELSE status END
                   WHERE id = ? AND farmer_id = ?`;
      updateParams = [response, new Date().toISOString(), inquiryId, user.id];
    }
  } else {
    updateSql = "UPDATE inquiries SET status = ? WHERE id = ? AND farmer_id = ?";
    updateParams = [body.status, inquiryId, user.id];
  }
  await run(updateSql, updateParams);
  await persistDatabase();
  return NextResponse.json({ ok: true });
}
