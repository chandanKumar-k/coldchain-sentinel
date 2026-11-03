import { NextResponse } from "next/server";
import { pool } from "@/lib/db";
export async function POST(req: Request) {
  const { alert_id, inspection_date, decision } = await req.json();
  if (!["CLEARED", "CONTINUE_QUARANTINE", "DISPOSE"].includes(decision) || !inspection_date || !alert_id)
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  try {
    await pool.execute("INSERT INTO inspection(alert_id,inspection_date,decision) VALUES (?,?,?)", [alert_id, inspection_date, decision]);
    return NextResponse.json({ ok: true });
  } catch { return NextResponse.json({ error: "Alert not found" }, { status: 404 }); }
}
