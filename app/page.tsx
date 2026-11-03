"use client";
import { useEffect, useState } from "react";
export default function Dashboard() {
  const [d, setD] = useState<any>(null); const [err, setErr] = useState("");
  useEffect(() => { fetch("/api/dashboard").then(r => r.json()).then(j => j.error ? setErr(j.error) : setD(j)); }, []);
  if (err) return <p className="text-red-600">{err}</p>; if (!d) return <p>Loading…</p>;
  const cards = [["Products", d.counts.products], ["Batches", d.counts.batches], ["Sensors", d.counts.sensors],
    ["Active Alerts", d.counts.activeAlerts], ["Critical", d.counts.critical], ["High Risk Batches", d.counts.highRisk]];
  return (<div className="space-y-6">
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">{cards.map(([k, v]) =>
      <div key={k as string} className="bg-white rounded-lg shadow p-4"><div className="text-sm text-slate-500">{k}</div><div className="text-3xl font-bold">{v}</div></div>)}</div>
    <section><h2 className="font-semibold mb-2">Temperature Monitoring (allowed {d.range[0]}–{d.range[1]}°C)</h2>
      {d.sensors.map((s: any) => <div key={s.code} className="bg-white rounded shadow p-3 mb-2 flex items-center gap-4">
        <b className="w-24">{s.code}</b><span className="w-20">{s.temperature}°C</span>
        <span className={`px-2 rounded text-white text-sm ${s.status === "NORMAL" ? "bg-green-600" : "bg-red-600"}`}>{s.status}</span>
        <svg viewBox="0 0 100 20" className="h-6 flex-1"><polyline fill="none" stroke="#0369a1" strokeWidth="1"
          points={s.history.map((t: number, i: number) => `${i * (100 / Math.max(1, s.history.length - 1))},${20 - Math.min(20, Math.max(0, t * 1.5))}`).join(" ")} /></svg></div>)}</section>
    <section><h2 className="font-semibold mb-2">Recent Alerts</h2>
      <table className="w-full bg-white shadow rounded"><tbody>{d.alerts.map((a: any) =>
        <tr key={a.alert_id} className="border-b"><td className="p-2">{a.batch_number}</td><td>{a.severity}</td><td>{a.status}</td></tr>)}</tbody></table></section></div>);
}
