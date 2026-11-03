import { NextResponse } from "next/server";
import { pool, readings } from "@/lib/db";
import { isExcursion, severityFor, riskScore } from "@/lib/config";
// POST {sensor_code, temperature, duration?}: reading -> MongoDB; if out of range -> excursion + risk (MySQL transaction)
export async function POST(req: Request) {
  const { sensor_code, temperature, duration = 15 } = await req.json();
  const t = Number(temperature);
  if (!sensor_code || !Number.isFinite(t) || t < -80 || t > 60) return NextResponse.json({ error: "Invalid temperature or sensor" }, { status: 400 });
  const [s]: any = await pool.execute("SELECT sensor_id, storage_unit_id FROM sensor WHERE sensor_code=?", [sensor_code]);
  if (!s.length) return NextResponse.json({ error: "Invalid sensor" }, { status: 404 });
  await (await readings()).insertOne({ reading_id: crypto.randomUUID(), sensor_id: s[0].sensor_id, timestamp: new Date(), temperature: t });
  if (!isExcursion(t)) return NextResponse.json({ status: "NORMAL" });
  const [b]: any = await pool.execute(`SELECT b.batch_id FROM batch b JOIN storage_unit u ON u.facility_id=b.facility_id WHERE u.storage_unit_id=? LIMIT 1`, [s[0].storage_unit_id]);
  if (!b.length) return NextResponse.json({ status: "EXCURSION", note: "No batch in this facility" });
  const sev = severityFor(t);
  await pool.execute("CALL RecordExcursionWithRisk(?,?,?,?)", [b[0].batch_id, sev, duration, riskScore(t, duration)]);
  return NextResponse.json({ status: "EXCURSION", severity: sev });
}
