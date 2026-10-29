import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const runtime = "nodejs";

type Props = { params: Promise<{ id: string }> };
const VALID_STATUSES = ["DRAFT", "SENT", "PENDING_APPROVAL", "NEEDS_REVISION", "APPROVED"] as const;
const ALLOWED_ROLES = ["ADMIN", "MASTER_USER", "CONTRACTS"];

export async function PATCH(request: Request, { params }: Props) {
  try {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    if (!ALLOWED_ROLES.includes(user.role)) {
      return NextResponse.json({ error: "You do not have permission to update report statuses." }, { status: 403 });
    }

    const { id } = await params;
    if (!id) return NextResponse.json({ error: "Report ID is required." }, { status: 400 });

    let body: unknown;
    try { body = await request.json(); }
    catch { return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }); }
    const status = body && typeof body === "object" && "status" in body ? body.status : undefined;
    if (typeof status !== "string" || !VALID_STATUSES.some((allowed) => allowed === status)) {
      return NextResponse.json({ error: "Invalid report status." }, { status: 400 });
    }

    const result = await pool.query<{ id: string; status: string }>(
      `UPDATE "ExtraWorkReport"
       SET "status" = $2::"ReportStatus", "updatedAt" = NOW()
       WHERE "id" = $1
       RETURNING "id", "status"`,
      [id, status],
    );
    if (!result.rowCount) return NextResponse.json({ error: "Work report not found." }, { status: 404 });
    return NextResponse.json({ message: "Work report status updated successfully.", reportId: result.rows[0].id, status: result.rows[0].status });
  } catch (error) {
    console.error("UPDATE EWR STATUS ERROR:", error);
    return NextResponse.json({ error: "Unable to update work report status." }, { status: 500 });
  }
}
