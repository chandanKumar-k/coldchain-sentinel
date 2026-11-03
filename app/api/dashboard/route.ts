import { NextResponse } from "next/server";
import { pool, readings } from "@/lib/db";
import { TEMP_MIN, TEMP_MAX, isExcursion } from "@/lib/config";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [rows]: any = await pool.query(`SELECT
      (SELECT COUNT(*) FROM product) products,(SELECT COUNT(*) FROM batch) batches,
      (SELECT COUNT(*) FROM sensor) sensors,(SELECT COUNT(*) FROM active_alerts) activeAlerts,
      (SELECT COUNT(*) FROM active_alerts WHERE severity='CRITICAL') critical,
      (SELECT COUNT(DISTINCT e.batch_id) FROM excursion e JOIN risk_assessment r USING(excursion_id) WHERE r.risk_score>=70) highRisk`);
    const [sensors]: any = await pool.query("SELECT sensor_id, sensor_code FROM sensor");
    const col = await readings();
    const latest = await Promise.all(sensors.map(async (s: any) => {
      const r = await col.find({ sensor_id: s.sensor_id }).sort({ timestamp: -1 }).limit(10).toArray();
      const t = r[0]?.temperature;
      return { code: s.sensor_code, temperature: t, status: t == null ? "NO DATA" : isExcursion(t) ? "EXCURSION" : "NORMAL",
        history: r.reverse().map((x) => x.temperature) };
    }));
    const [alerts] = await pool.query("SELECT * FROM active_alerts ORDER BY alert_id DESC LIMIT 5");
    return NextResponse.json({ counts: rows[0], range: [TEMP_MIN, TEMP_MAX], sensors: latest, alerts });
  } catch { return NextResponse.json({ error: "Database connection failed" }, { status: 500 }); }
}
