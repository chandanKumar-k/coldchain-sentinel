import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
export const dynamic = "force-dynamic";
export async function GET() {
  const [rows] = await pool.query(`SELECT a.alert_id,b.batch_number,a.severity,a.status FROM alert a JOIN batch b USING(batch_id) ORDER BY a.alert_id DESC`);
  return NextResponse.json(rows);
}
export async function PUT(req: Request) {
  const { alert_id, status } = await req.json();
  if (!["OPEN", "ACKNOWLEDGED", "RESOLVED"].includes(status)) return NextResponse.json({ error: "Invalid alert status" }, { status: 400 });
  const [r]: any = await pool.execute("UPDATE alert SET status=? WHERE alert_id=?", [status, alert_id]);
  return r.affectedRows ? NextResponse.json({ ok: true }) : NextResponse.json({ error: "Alert not found" }, { status: 404 });
}
